import { Component, OnInit, Input } from '@angular/core';
import { GridOptions } from 'ag-grid-community';
import { GroupsService } from '@services/groups.service';
import { WafSetting } from '@common/types';
import { MatDialog } from '@angular/material/dialog';
import { GroupWafConfigModalComponent } from '@components/group-details/partial/group-waf-config-modal/group-waf-config-modal.component';
import { AuthUtilsService } from '@common/utils/auth.utils';
import { GlobalConstant } from '@common/constants/global.constant';
import { NotificationService } from '@services/notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-group-waf',
  templateUrl: './group-waf.component.html',
  styleUrls: ['./group-waf.component.scss'],
})
export class GroupWafComponent implements OnInit {
  @Input() source: string;
  @Input() groupName: string = '';
  @Input() resizableHeight: number;
  @Input() cfgType: string;
  gridOptions4GroupWafSensors: GridOptions;
  groupWafSensors: Array<WafSetting> = [];
  filteredCount: number = 0;
  selectedSensor: WafSetting;
  enabled: boolean = false;
  isWriteWafAuthorized: boolean;
  CFG_TYPE = GlobalConstant.CFG_TYPE;

  constructor(
    private groupsService: GroupsService,
    private dialog: MatDialog,
    private authUtilsService: AuthUtilsService,
    private notificationService: NotificationService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.isWriteWafAuthorized =
      this.authUtilsService.getDisplayFlag('write_waf_rule');
    this.gridOptions4GroupWafSensors =
      this.groupsService.prepareGrid4GroupWafSensors();
    this.gridOptions4GroupWafSensors.onSelectionChanged = () => {
      this.selectedSensor =
        this.gridOptions4GroupWafSensors.api!.getSelectedRows()[0];
    };
    this.refresh();
  }

  refresh = () => {
    this.groupsService.getGroupWafSensorData(this.groupName).subscribe(
      (response: any) => {
        if (response.sensors.length === 0) {
          if (response.status) {
            this.gridOptions4GroupWafSensors.overlayNoRowsTemplate = `<div class="server-error">
                  <div>
                    <em class="eos-icons text-warning" aria-hidden="true">gpp_maybe</em>
                  </div>
                  <div>
                    <div>${this.translate.instant(
                      'group.waf.msg.ADD_WAF_WARNING'
                    )}</div>
                  </div>
                </div>`;
          } else {
            this.gridOptions4GroupWafSensors.overlayNoRowsTemplate = `<span class="overlay">${this.translate.instant(
              'general.NO_ROWS'
            )}</span>`;
          }
        }
        this.groupWafSensors = response.sensors;
        this.gridOptions4GroupWafSensors.api!.setRowData(this.groupWafSensors);
        this.enabled = response.status;
        this.filteredCount = this.groupWafSensors.length;
      },
      error => {}
    );
  };

  openEditGroupSensorModal = (warning = '') => {
    const addEditDialogRef = this.dialog.open(GroupWafConfigModalComponent, {
      width: '80%',
      data: {
        configuredSensors: this.groupWafSensors,
        groupName: this.groupName,
        status: this.enabled,
        warning: warning,
        refresh: this.refresh,
      },
    });
  };

  toggleWAFConfigEnablement = enabled => {
    let payload = {
      config: {
        name: this.groupName,
        status: !enabled,
      },
    };
    this.groupsService.updateGroupWafSensorData(payload).subscribe(
      (response: any) => {
        if (!enabled && this.groupWafSensors.length === 0) {
          this.openEditGroupSensorModal(
            this.translate.instant('group.waf.msg.ADD_WAF_WARNING')
          );
        }
        setTimeout(() => {
          this.refresh();
        }, 1000);
        this.notificationService.open(
          enabled
            ? this.translate.instant('group.waf.msg.DISABLED_OK')
            : this.translate.instant('group.waf.msg.ENABLED_OK')
        );
      },
      error => {
        this.notificationService.openError(
          error,
          enabled
            ? this.translate.instant('group.waf.msg.DISABLED_NG')
            : this.translate.instant('group.waf.msg.ENABLED_NG')
        );
      }
    );
  };
}
