import { Component, OnInit, Input } from '@angular/core';
import { ContainersService } from '@common/services/containers.service';

@Component({
  selector: 'app-members',
  templateUrl: './members.component.html',
  styleUrls: ['./members.component.scss']
})
export class MembersComponent implements OnInit {

  @Input() source: string;
  @Input() groupName: string = '';
  @Input() resizableHeight: number;
  @Input() members: any;
  @Input() kind: string;
  memberGridRowData: any;

  constructor(
    private containersService: ContainersService
  ) { }

  ngOnInit(): void {
    this.memberGridRowData =  this.kind === 'node' ? this.members : this.containersService.formatScannedWorkloads(this.members);
    console.log(this.memberGridRowData)
  }

}
