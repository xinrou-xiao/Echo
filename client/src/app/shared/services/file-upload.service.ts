import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface PresignedUrlResponse {
    success: boolean;
    presignedUrl: string;
    fileUrl: string;
}

@Injectable({
    providedIn: 'root'
})
export class FileUploadService {
    private http = inject(HttpClient);

    getPresignedUrl(fileName: string, fileType: string): Observable<PresignedUrlResponse> {
        return this.http.get<PresignedUrlResponse>(`${environment.apiUrl}/upload/presigned-url`, {
            params: { fileName, fileType }
        });
    }

    uploadToS3(presignedUrl: string, file: File): Observable<any> {
        return this.http.put(presignedUrl, file, {
            headers: {
                'Content-Type': file.type
            }
        });
    }
}