import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
     private readonly logger = new Logger(CloudinaryService.name);

     constructor(private readonly configService: ConfigService) {
          cloudinary.config({
               cloud_name: this.configService.get<string>('cloudinary.cloudName'),
               api_key: this.configService.get<string>('cloudinary.apiKey'),
               api_secret: this.configService.get<string>('cloudinary.apiSecret'),
          });
     }

     async uploadImage(file: Express.Multer.File, folder: string = 'innora-hotel'): Promise<UploadApiResponse> {
          return new Promise((resolve, reject) => {
               const uploadStream = cloudinary.uploader.upload_stream(
                    {
                         folder,
                         resource_type: 'auto',
                    },
                    (error, result) => {
                         if (error) return reject(error);
                         if (!result) return reject(new Error('Cloudinary upload returned null'));
                         resolve(result);
                    },
               );
               uploadStream.end(file.buffer);
          });
     }
}
