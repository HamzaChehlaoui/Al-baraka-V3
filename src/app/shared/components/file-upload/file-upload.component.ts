import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface FileUploadConfig {
  accept: string;
  maxSize: number; // in MB
  multiple: boolean;
}

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="file-upload-container">
      <div
        class="upload-zone"
        [ngClass]="{'drag-over': isDragOver, 'has-file': selectedFile}"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <input
          #fileInput
          type="file"
          [accept]="config.accept"
          [multiple]="config.multiple"
          (change)="onFileSelected($event)"
          hidden
        />

        <div *ngIf="!selectedFile" class="upload-prompt">
          <span class="upload-icon">📎</span>
          <p class="upload-text">{{ label }}</p>
          <p class="upload-hint">Glissez-déposez ou cliquez pour sélectionner</p>
          <p class="upload-formats">Formats: {{ config.accept }} (max {{ config.maxSize }}MB)</p>
        </div>

        <div *ngIf="selectedFile" class="file-preview">
          <span class="file-icon">{{ getFileIcon() }}</span>
          <div class="file-info">
            <p class="file-name">{{ selectedFile.name }}</p>
            <p class="file-size">{{ formatFileSize(selectedFile.size) }}</p>
          </div>
          <button class="btn-remove" (click)="removeFile($event)">×</button>
        </div>
      </div>

      <div *ngIf="error" class="upload-error">
        ⚠️ {{ error }}
      </div>

      <div *ngIf="isUploading" class="upload-progress">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress"></div>
        </div>
        <span class="progress-text">{{ uploadProgress }}%</span>
      </div>
    </div>
  `,
  styles: [`
    .file-upload-container {
      width: 100%;
    }

    .upload-zone {
      border: 2px dashed rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(255, 255, 255, 0.02);
    }

    .upload-zone:hover {
      border-color: rgba(102, 126, 234, 0.5);
      background: rgba(102, 126, 234, 0.05);
    }

    .upload-zone.drag-over {
      border-color: #667eea;
      background: rgba(102, 126, 234, 0.1);
    }

    .upload-zone.has-file {
      border-style: solid;
      border-color: rgba(34, 197, 94, 0.5);
      background: rgba(34, 197, 94, 0.05);
    }

    .upload-prompt {
      color: rgba(255, 255, 255, 0.7);
    }

    .upload-icon {
      font-size: 2.5rem;
      display: block;
      margin-bottom: 0.75rem;
    }

    .upload-text {
      font-size: 1rem;
      margin: 0 0 0.5rem 0;
      color: #fff;
    }

    .upload-hint {
      font-size: 0.85rem;
      margin: 0 0 0.25rem 0;
      color: rgba(255, 255, 255, 0.5);
    }

    .upload-formats {
      font-size: 0.75rem;
      margin: 0;
      color: rgba(255, 255, 255, 0.4);
    }

    .file-preview {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-align: left;
    }

    .file-icon {
      font-size: 2rem;
    }

    .file-info {
      flex: 1;
    }

    .file-name {
      margin: 0;
      color: #fff;
      font-weight: 500;
      word-break: break-all;
    }

    .file-size {
      margin: 0.25rem 0 0 0;
      font-size: 0.8rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .btn-remove {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
      border: none;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 1.25rem;
      line-height: 1;
      transition: all 0.3s ease;
    }

    .btn-remove:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .upload-error {
      margin-top: 0.75rem;
      padding: 0.75rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: 8px;
      color: #fca5a5;
      font-size: 0.85rem;
    }

    .upload-progress {
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .progress-bar {
      flex: 1;
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
      transition: width 0.3s ease;
    }

    .progress-text {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.7);
      min-width: 45px;
    }
  `]
})
export class FileUploadComponent {
  @Input() label: string = 'Télécharger un fichier';
  @Input() config: FileUploadConfig = {
    accept: '.pdf,.jpg,.jpeg,.png',
    maxSize: 5,
    multiple: false
  };

  @Output() fileSelected = new EventEmitter<File>();
  @Output() fileRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  isDragOver: boolean = false;
  error: string = '';
  isUploading: boolean = false;
  uploadProgress: number = 0;

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File): void {
    this.error = '';

    // Vérifier le type de fichier
    const acceptedTypes = this.config.accept.split(',').map(t => t.trim());
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const fileMimeType = file.type;

    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return fileExtension === type.toLowerCase();
      }
      return fileMimeType.includes(type.replace('*', ''));
    });

    if (!isAccepted) {
      this.error = `Format non accepté. Formats autorisés: ${this.config.accept}`;
      return;
    }

    // Vérifier la taille
    const maxSizeBytes = this.config.maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      this.error = `Fichier trop volumineux. Taille max: ${this.config.maxSize}MB`;
      return;
    }

    this.selectedFile = file;
    this.fileSelected.emit(file);
  }

  removeFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.error = '';
    this.fileRemoved.emit();
  }

  getFileIcon(): string {
    if (!this.selectedFile) return '📄';

    const extension = this.selectedFile.name.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return '📕';
      case 'jpg':
      case 'jpeg':
      case 'png': return '🖼️';
      default: return '📄';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}
