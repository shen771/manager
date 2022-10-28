import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { GlobalConstant } from '@common/constants/global.constant';
import { GroupsService } from '@services/groups.service';
import { GroupsComponent } from '@components/groups/groups.component';
import { ImportFileModalComponent } from '@components/ui/import-file-modal/import-file-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { PathConstant } from '@common/constants/path.constant';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { MultiClusterService } from "@services/multi-cluster.service";

@Component({
  selector: 'app-groups-page',
  templateUrl: './groups-page.component.html',
  styleUrls: ['./groups-page.component.scss'],
})
export class GroupsPageComponent implements OnInit {
  public navSource!: string;
  public refresh!: Function;
  refreshing$ = new Subject();
  public isShowingSystemGroups: boolean = true;
  public netServiceStatus: boolean = false;
  public netServicePolicyMode!: string;
  @ViewChild(GroupsComponent) groupsView!: GroupsComponent;
  private _switchClusterSubscription;

  constructor(
    private groupsService: GroupsService,
    private dialog: MatDialog,
    private translate: TranslateService,
    private multiClusterService: MultiClusterService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.navSource = GlobalConstant.NAV_SOURCE.SELF;
    //refresh the page when it switched to a remote cluster
    this._switchClusterSubscription = this.multiClusterService.onClusterSwitchedEvent$.subscribe(data => {
      this.refresh();
    });
  }

  ngOnDestroy(): void {
    if(this._switchClusterSubscription){
      this._switchClusterSubscription.unsubscribe();
    }
  }

  refreshing(isRefresh: boolean) {
    this.refreshing$.next(isRefresh);
  }

  ngAfterViewInit() {
    this.refresh = () => {
      this.getConfig();
      this.groupsView.getGroups();
    };
    this.cd.detectChanges();
  }

  toggleSystemGroup = () => {
    this.isShowingSystemGroups = !this.isShowingSystemGroups;
    if (!this.isShowingSystemGroups) {
      this.groupsView.groups = this.groupsView.groups.filter(function (item) {
        return !item.platform_role;
      });
      this.groupsView.gridOptions4Groups.api!.setRowData(
        this.groupsView.groups
      );
    } else {
      this.refresh();
    }
  };

  openImportGroupsDialog = () => {
    const importDialogRef = this.dialog.open(ImportFileModalComponent, {
      data: {
        importUrl: PathConstant.IMPORT_GROUP_URL,
      },
      disableClose: true,
    });
    importDialogRef.afterClosed().subscribe(result => {
      setTimeout(() => {
        this.refresh();
      }, 500);
    });
  };

  private getConfig = () => {
    this.groupsService.getConfigData().subscribe(
      (response: any) => {
        this.netServiceStatus = response.net_service_status;
        this.netServicePolicyMode = this.translate.instant(
          `enum.${response.net_service_policy_mode.toUpperCase()}`
        );
      },
      error => {}
    );
  };
}