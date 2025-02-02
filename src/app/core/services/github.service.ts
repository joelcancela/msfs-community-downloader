import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Package } from './packages.service';

@Injectable({
    providedIn: 'root'
})
export class GithubService {

    constructor(private http: HttpClient) { }

    retrievePackageInfo(p: Package): Promise<PackageInfo> {
        const route = `https://api.github.com/repos/${p.githubOwner}/${p.githubRepo}/releases?per_page=100`;
        return this.http.get<GithubRelease[]>(route).toPromise()        
            .then((rel: GithubRelease[]) => {
                const lastRelease = rel
                    .sort((a, b) => {
                        return new Date(b.published_at).getTime() - new Date(a.published_at).getTime();
                    })
                    .find(x => this.isCandidate(x, p));

                if(!lastRelease) return null;

                const asset = lastRelease.assets.find(y => y.name.includes(p.assetName));
                
                let downloadUrl = lastRelease.zipball_url;
                if(asset){
                    downloadUrl = asset.browser_download_url;
                }

                const res = new PackageInfo(lastRelease.tag_name, downloadUrl, lastRelease.published_at, lastRelease.html_url);
                return res;
            });
    }

    private isCandidate(rel: GithubRelease, p: Package): boolean {
        let keepPrerelease = false;
        if(p.isPrerelease) {
            keepPrerelease = true;
        }

        return  rel.draft === false 
                && rel.prerelease === keepPrerelease
                && (!p.assetName || rel.assets.findIndex(y => y.name.includes(p.assetName)) !== -1);
    }
}

export class PackageInfo {
    constructor(
        public availableVersion: string,
        public downloadUrl: string,
        public publishedAt: Date,
        public html_url: string) { }
}

interface GithubRelease {
    tag_name: string;
    target_commitish: string;
    draft: boolean;
    prerelease: boolean;
    assets: GithubAsset[];
    zipball_url: string;
    published_at: Date;
    html_url: string;
}

interface GithubAsset {
    name: string;
    browser_download_url: string;
}
