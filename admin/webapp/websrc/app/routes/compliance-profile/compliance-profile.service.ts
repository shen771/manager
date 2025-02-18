import { Injectable } from '@angular/core';
import { RisksHttpService } from '@common/api/risks-http.service';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { catchError, map, repeatWhen, tap } from 'rxjs/operators';
import { AssetsHttpService } from '@common/api/assets-http.service';
import {
  ComplianceProfileData,
  complianceProfileEntries,
  ComplianceProfileTemplateData,
  DomainGetResponse,
} from '@common/types';
import { MapConstant } from '@common/constants/map.constant';

@Injectable()
export class ComplianceProfileService {
  private resizeSubject$ = new BehaviorSubject<boolean>(true);
  resize$ = this.resizeSubject$.asObservable();
  private refreshSubject$ = new BehaviorSubject<boolean>(false);
  lastEntries!: complianceProfileEntries[];

  constructor(
    private risksHttpService: RisksHttpService,
    private assetsHttpService: AssetsHttpService
  ) {}

  refresh() {
    setTimeout(() => {
      this.refreshSubject$.next(false);
    }, 500);
  }

  initComplianceProfile() {
    return combineLatest([
      this.getTemplate(),
      this.getProfile(),
      this.getDomain(),
    ]).pipe(
      map(([template, profile, domains]) => {
        return {
          template,
          profile,
          domains,
        };
      }),
      tap(({ profile }) => {
        this.lastEntries = profile.profiles[0]?.entries || [];
      }),
      map(res => {
        res.profile.profiles[0]?.entries.forEach(p => {
          res.template.list.compliance.forEach(e => {
            if (e.test_number === p.test_number) {
              e.tags = p.tags;
            }
          });
        });
        return res;
      }),
      repeatWhen(() => this.refreshSubject$)
    );
  }

  resize() {
    this.resizeSubject$.next(true);
  }

  saveRegulations(payload) {
    return this.risksHttpService.patchComplianceProfile(payload);
  }

  saveTemplates(payload) {
    return this.assetsHttpService.patchDomain(payload);
  }

  private getTemplate(): Observable<ComplianceProfileTemplateData> {
    return this.risksHttpService.getComplianceProfileTemplate().pipe(
      catchError(err => {
        if (
          [MapConstant.NOT_FOUND, MapConstant.ACC_FORBIDDEN].includes(
            err.status
          )
        ) {
          return of({ list: { compliance: [] } });
        } else {
          throw err;
        }
      })
    );
  }

  private getProfile(): Observable<ComplianceProfileData> {
    return this.risksHttpService.getComplianceProfile().pipe(
      catchError(err => {
        if (
          [MapConstant.NOT_FOUND, MapConstant.ACC_FORBIDDEN].includes(
            err.status
          )
        ) {
          return of({ profiles: [] });
        } else {
          throw err;
        }
      })
    );
  }

  private getDomain(): Observable<DomainGetResponse> {
    return this.assetsHttpService.getDomain().pipe(
      map(res => {
        res['imageTags'] =
          res.domains.find(item => item.name === '_images')?.tags || [];
        res['containerTags'] =
          res.domains.find(item => item.name === '_containers')?.tags || [];
        res['nodeTags'] =
          res.domains.find(item => item.name === '_nodes')?.tags || [];
        res.domains = res.domains.filter(d => d.name.charAt(0) !== '_');
        return res;
      }),
      catchError(err => {
        if (
          [MapConstant.NOT_FOUND, MapConstant.ACC_FORBIDDEN].includes(
            err.status
          )
        ) {
          return of({
            domains: [],
            imageTags: [],
            containerTags: [],
            nodeTags: [],
          } as any);
        } else {
          throw err;
        }
      })
    );
  }
}
