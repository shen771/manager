import { Component, Input, OnInit } from '@angular/core';
import { ErrorResponse, Group, PolicyMode, Service } from '@common/types';
import { UtilsService } from '@common/utils/app.utils';
import { TranslateService } from '@ngx-translate/core';
import { ServiceModeTypes } from '@routes/settings/configuration/config-form/config-form-config/constants';
import { NotificationService } from '@services/notification.service';
import { ScoreImprovementModalService } from '@services/score-improvement-modal.service';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'app-score-improvement-service-risk-view',
  templateUrl: './score-improvement-service-risk-view.component.html',
  styleUrls: ['./score-improvement-service-risk-view.component.scss'],
})
export class ScoreImprovementServiceRiskViewComponent implements OnInit {
  @Input() isGlobalUser!: boolean;
  get score() {
    return this.scoreImprovementModalService.score;
  }
  projectedScore!: number;
  newServiceMode!: PolicyMode;
  selectedGroup!: Group | null;
  get serviceModes() {
    return ServiceModeTypes;
  }

  constructor(
    private scoreImprovementModalService: ScoreImprovementModalService,
    private settingsService: SettingsService,
    private notificationService: NotificationService,
    private utils: UtilsService,
    private tr: TranslateService
  ) {}

  ngOnInit(): void {
    this.getPredictionScores();
    this.getServiceMode();
  }

  getServiceMode() {
    this.settingsService.getConfig().subscribe(config => {
      this.newServiceMode = config.new_svc.new_service_policy_mode;
    });
  }

  switchNewServiceMode() {
    this.settingsService
      .patchConfigServiceMode({
        new_service_policy_mode: this.newServiceMode,
      })
      .subscribe({
        complete: () => {
          this.notificationService.open(this.tr.instant('setting.SUBMIT_OK'));
        },
        error: ({ error }: { error: ErrorResponse }) => {
          this.notificationService.open(
            this.utils.getAlertifyMsg(
              error,
              this.tr.instant('setting.SUBMIT_FAILED'),
              false
            )
          );
        },
      });
  }

  getPredictionScores() {
    const metrics = this.scoreImprovementModalService.newMetrics();
    metrics.new_service_policy_mode = 'Protect';
    metrics.protect_groups += metrics.discover_groups + metrics.monitor_groups;
    metrics.monitor_groups = 0;
    metrics.discover_groups = 0;
    metrics.protect_ext_eps +=
      metrics.discover_ext_eps + metrics.monitor_ext_eps;
    metrics.monitor_ext_eps = 0;
    metrics.discover_ext_eps = 0;
    metrics.discover_groups_zero_drift = 0;
    this.scoreImprovementModalService
      .calculateScoreData(
        metrics,
        this.isGlobalUser,
        this.scoreImprovementModalService.scoreInfo.header_data.running_pods
      )
      .subscribe(scores => {
        this.projectedScore = scores.securityRiskScore;
      });
  }

  setSelectedGroup(group: Group | Service | null) {
    this.selectedGroup = group as Group;
  }
}
