import {
     BadRequestException,
     Controller,
     Post,
     UploadedFile,
     UseGuards,
     UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CloudinaryService } from './cloudinary.service';

@ApiTags('Cloudinary Uploads')
@Controller('uploads')
export class CloudinaryController {
     constructor(private readonly cloudinaryService: CloudinaryService) {}

     @Post('image')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Upload an image to Cloudinary' })
     @ApiConsumes('multipart/form-data')
     @ApiBody({
          schema: {
               type: 'object',
               properties: {
                    file: {
                         type: 'string',
                         format: 'binary',
                    },
               },
          },
     })
     @UseInterceptors(FileInterceptor('file'))
     async uploadImage(@UploadedFile() file: Express.Multer.File) {
          if (!file) {
               throw new BadRequestException('No file uploaded');
          }
          const result = await this.cloudinaryService.uploadImage(file);
          return {
               url: result.secure_url,
               publicId: result.public_id,
          };
     }
}
