import { Component, OnInit, Input, Output } from '@angular/core';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { Subject } from 'rxjs';
import { faArrowDown, faTrash, faTrashAlt, faPencilAlt } from '@fortawesome/free-solid-svg-icons';

import { Package, InstallStatusEnum } from '../../core/services/packages.service';
import { DomainService } from '../../core/services/domain.service';


@Component({
    selector: 'app-package-detailed',
    templateUrl: './package-detailed.component.html',
    styleUrls: ['./package-detailed.component.scss']
})
export class PackageDetailedComponent implements OnInit {
    faGithub = faGithub;
    faArrowDown = faArrowDown;
    faTrash = faTrash;
    faTrashAlt = faTrashAlt;
    faPencilAlt = faPencilAlt;

    @Input() package: Package;
    updatingStatus: string;

    @Output()
    deletedEvent = new Subject<Package>();

    constructor(
        private domainService: DomainService,
    ) { }

    ngOnInit(): void {
    }

    install(): boolean {
        this.domainService.install(this.package);
        return false;
    }

    remove(): boolean {
        this.domainService.remove(this.package);
        return false;
    }

    update(): boolean {
        this.domainService.update(this.package);
        return false;
    }

    getWorkingInfo(): string {
        const p = this.package;
        if (p.state === InstallStatusEnum.downloading) {
            if (p.downloaded) {
                return `${p.downloaded} MB`;
            } else {
                return `0 MB`;
            }
        }
        if (p.state === InstallStatusEnum.extracting) {
            return "Extracting...";
        }
        if (p.state === InstallStatusEnum.installing) {
            return "Installing...";
        }
    }

    cleanUpVersion(version: string): string {
        if(!version && this.package.state === InstallStatusEnum.untrackedPackageFound) return "Unknown";

        const pattern = this.package.versionPatternToRemove;
        if(!pattern || !version) return version;
        return version.replace(pattern, '');
    }

    removePackage(): boolean {
        if(!this.package.isCustomPackage && !this.package.isOnlinePackage) return false;

        if(this.package.isCustomPackage){
            this.domainService.removeCustomPackage(this.package);
        } else {
            this.domainService.removeOnlinePackage(this.package);
        }
        
        this.deletedEvent.next(this.package);
        return false;
    }
}
