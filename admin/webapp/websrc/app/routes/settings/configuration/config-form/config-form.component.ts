import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GlobalConstant } from '@common/constants/global.constant';
import {
  ConfigPatch,
  ConfigV2Response,
  ErrorResponse,
  IBMSetupGetResponse,
} from '@common/types';
import { UtilsService } from '@common/utils/app.utils';
import { AuthUtilsService } from '@common/utils/auth.utils';
import { GlobalVariable } from '@common/variables/global.variable';
import { FormlyFormOptions } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { NotificationService } from '@services/notification.service';
import { SettingsService } from '@services/settings.service';
import { cloneDeep } from 'lodash';
import { ConfigFormConfig } from './config-form-config';
import { OtherWebhookType } from './config-form-config/constants';

@Component({
  selector: 'app-config-form',
  templateUrl: './config-form.component.html',
  styleUrls: ['./config-form.component.scss'],
})
export class ConfigFormComponent implements OnInit {
  @Output() refreshConfig = new EventEmitter();
  ibmSetup!: IBMSetupGetResponse;
  submittingForm = false;
  configForm = new FormGroup({});
  configFields = cloneDeep(ConfigFormConfig);
  configOptions: FormlyFormOptions = {
    formState: {
      isCreated: {
        httpProxy: false,
        httpsProxy: false,
      },
      isOpenShift: () => GlobalVariable.isOpenShift,
      permissions: {},
      ibmsa: {
        setup: this.setupIBMSA.bind(this),
        enabled: false,
      },
      tr: {
        rancher_ep: this.tr.instant('setting.RANCHER_EP'),
        min_max: this.tr.instant('setting.autoscale.MIN_MAX'),
      },
      slider_formatter: this.utils.convertHours.bind(this.utils),
    },
  };
  get dashboardUrl(): string {
    return `${this.document.location.origin}/`;
  }

  constructor(
    private settingsService: SettingsService,
    private utils: UtilsService,
    private tr: TranslateService,
    private authUtilsService: AuthUtilsService,
    private notificationService: NotificationService,
    private cd: ChangeDetectorRef,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit(): void {
    const isSettingAuth = this.authUtilsService.getDisplayFlag('write_config');
    this.configOptions.formState.permissions = {
      isAuthenticateRBACAuthorized: isSettingAuth,
      isNewServiceModeAuthorized: isSettingAuth,
      isClusterAuthorized: isSettingAuth,
      isWebhookAuthorized: isSettingAuth,
      isSyslogAuthorized: isSettingAuth,
      isRegHttpProxyAuthorized: isSettingAuth,
      isRegHttpsProxyAuthorized: isSettingAuth,
      isConfigAuthorized: isSettingAuth,
      isIBMSAAuthorized: isSettingAuth,
    };
    this.cd.detectChanges();
  }

  private _config!: ConfigV2Response;

  get config(): ConfigV2Response {
    return this._config;
  }

  @Input() set config(val) {
    this._config = val;
    if (this._config.proxy.registry_http_proxy.url) {
      this.configOptions.formState.isCreated.httpProxy = true;
    }
    if (this._config.proxy.registry_https_proxy.url) {
      this.configOptions.formState.isCreated.httpsProxy = true;
    }
    if (this._config.misc.unused_group_aging) {
      this._config.duration_toggle = true;
    }
    this._config.mode_auto.mode_auto_d2m_duration /= 3600;
    this._config.mode_auto.mode_auto_m2p_duration /= 3600;
    this._config.webhooks.forEach(e => {
      e.isEditable = false;
      e.type = e.type || OtherWebhookType;
    });
    this._config.ibmsa.ibmsa_ep_dashboard_url ||= this.dashboardUrl;
    if (this.configOptions.resetModel) {
      this.configOptions.resetModel(this._config);
      setTimeout(() => {
        if (this.configOptions.resetModel) {
          this.configOptions.resetModel(this._config);
        }
      });
    }
    this.submittingForm = false;
  }

  submitForm(): void {
    if (!this.configForm.valid) {
      return;
    }
    const configPatch: ConfigPatch = this.formatConfigPatch(
      this.configForm.getRawValue()
    );
    this.submittingForm = true;
    this.settingsService.patchConfig(configPatch).subscribe({
      complete: () => {
        this.notificationService.open(this.tr.instant('setting.SUBMIT_OK'));
        this.refreshConfig.emit();
      },
      error: ({ error }: { error: ErrorResponse }) => {
        this.notificationService.open(
          this.utils.getAlertifyMsg(
            error,
            this.tr.instant('setting.SUBMIT_FAILED'),
            false
          ),
          GlobalConstant.NOTIFICATION_TYPE.ERROR
        );
        this.submittingForm = false;
      },
    });
  }

  formatConfigPatch(base_config: ConfigV2Response): ConfigPatch {
    return {
      atmo_config: {
        mode_auto_d2m: base_config.mode_auto.mode_auto_d2m,
        mode_auto_d2m_duration:
          base_config.mode_auto.mode_auto_d2m_duration * 3600,
        mode_auto_m2p: base_config.mode_auto.mode_auto_m2p,
        mode_auto_m2p_duration:
          base_config.mode_auto.mode_auto_m2p_duration * 3600,
      },
      net_config: {
        net_service_policy_mode: base_config.net_svc.net_service_policy_mode,
        net_service_status: base_config.net_svc.net_service_status,
      },
      config_v2: {
        svc_cfg: {
          new_service_policy_mode: base_config.new_svc.new_service_policy_mode,
          new_service_profile_baseline:
            base_config.new_svc.new_service_profile_baseline,
        },
        svslog_cfg: {
          syslog_ip: base_config.syslog.syslog_ip,
          syslog_ip_proto: base_config.syslog.syslog_ip_proto,
          syslog_port: Number(base_config.syslog.syslog_port),
          syslog_level: base_config.syslog.syslog_level,
          syslog_status: base_config.syslog.syslog_status,
          syslog_categories: base_config.syslog.syslog_categories,
          syslog_in_json: base_config.syslog.syslog_in_json,
          single_cve_per_syslog: base_config.syslog.single_cve_per_syslog,
        },
        auth_cfg: {
          // NOTE: auth_cfg = {} - formly is missing auth_cfg fields
          auth_order: base_config.auth.auth_order,
          auth_by_platform: base_config.auth.auth_by_platform,
          rancher_ep: base_config.auth.rancher_ep,
        },
        proxy_cfg: {
          registry_http_proxy: base_config.proxy.registry_http_proxy.password
            ? base_config.proxy.registry_http_proxy
            : Object.assign({}, base_config.proxy.registry_http_proxy, {
                password: null,
              }),
          registry_http_proxy_status:
            base_config.proxy.registry_http_proxy_status,
          registry_https_proxy: base_config.proxy.registry_https_proxy.password
            ? base_config.proxy.registry_http_proxy
            : Object.assign({}, base_config.proxy.registry_https_proxy, {
                password: null,
              }),
          registry_https_proxy_status:
            base_config.proxy.registry_https_proxy_status,
        },
        webhooks: base_config.webhooks
          .filter(w => w.cfg_type !== GlobalConstant.CFG_TYPE.FED)
          .map(({ isEditable, ...webhook }) => {
            if (webhook.type === OtherWebhookType) {
              webhook.type = '';
            }
            return webhook;
          }),
        ibmsa_cfg: {
          ibmsa_ep_dashboard_url:
            base_config.ibmsa.ibmsa_ep_dashboard_url || this.dashboardUrl,
          ibmsa_ep_enabled: base_config.ibmsa.ibmsa_ep_enabled,
        },
        scanner_autoscale_cfg: base_config.scanner_autoscale,
        misc_cfg: {
          controller_debug: base_config.misc.controller_debug,
          unused_group_aging: base_config.duration_toggle
            ? base_config.misc.unused_group_aging
            : 0,
          cluster_name: base_config.misc.cluster_name,
          monitor_service_mesh: base_config.misc.monitor_service_mesh,
          xff_enabled: base_config.misc.xff_enabled,
          no_telemetry_report: base_config.misc.no_telemetry_report,
        },
      },
    };
  }

  setupIBMSA(): void {
    this.settingsService.getIBMSetup().subscribe({
      next: (setup: IBMSetupGetResponse) => {
        const expiring_time = this.utils.getDateByInterval(
          this.utils.parseDatetimeStr(new Date()),
          30,
          this.utils.CALENDAR.MINUTES,
          'yyyy-MM-dd HH:mm:ss'
        );
        setup.expiring_time = this.formatExpire(expiring_time || '');
        this.configForm.patchValue({ ibmsa_setup: setup });
      },
      error: ({ error }: { error: ErrorResponse }) => {
        this.configForm.patchValue({
          ibmsa_setup: {
            url: '',
            expiring_time: this.utils.getAlertifyMsg(
              error,
              this.tr.instant('setting.IBM_SA_ERR'),
              false
            ),
          },
        });
      },
    });
  }

  formatExpire(time: string) {
    return this.tr.instant('setting.URL_EXPIRE', { time: time });
  }
}
