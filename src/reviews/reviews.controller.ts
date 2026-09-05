import {
     Body,
     Controller,
     Delete,
     Get,
     Param,
     Patch,
     Post,
     Query,
     UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewStatus, UserRole } from '@prisma/client';
import { AuthUser, CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateReviewDto } from './dto/create-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { ReviewsService } from './reviews.service';

@ApiTags('Reviews')
@Controller()
export class ReviewsController {
     constructor(private readonly reviewsService: ReviewsService) {}

     @Public()
     @Post('reviews')
     @ApiOperation({ summary: 'Submit review for a room' })
     createReview(@Body() dto: CreateReviewDto, @CurrentUser() user?: AuthUser) {
          return this.reviewsService.create(dto.roomId, dto, user?.id);
     }

     // Legacy route compatibility: PATCH /rooms/:id/reviews
     @Public()
     @Patch('rooms/:id/reviews')
     @ApiOperation({ summary: 'Legacy room review route' })
     createReviewLegacy(
          @Param('id') id: string,
          @Body() dto: CreateReviewDto,
          @CurrentUser() user?: AuthUser,
     ) {
          return this.reviewsService.create(id, dto, user?.id);
     }

     @Public()
     @Get('reviews/room/:roomId')
     @ApiOperation({ summary: 'Get reviews for a room' })
     findByRoom(@Param('roomId') roomId: string, @Query() query: QueryReviewDto) {
          return this.reviewsService.findByRoom(roomId, query);
     }

     @Get('reviews')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.STAFF)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get all reviews (Admin/Staff)' })
     findAll(@Query() query: QueryReviewDto) {
          return this.reviewsService.findAll(query);
     }

     @Get('reviews/my')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Get current user reviews' })
     findMyReviews(@CurrentUser() user: AuthUser) {
          return this.reviewsService.findMyReviews(user.id);
     }

     @Get('reviews/:id')
     @ApiOperation({ summary: 'Get single review by ID' })
     findOne(@Param('id') id: string) {
          return this.reviewsService.findOne(id);
     }

     @Patch('reviews/:id')
     @UseGuards(JwtAuthGuard)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Update review content' })
     update(@Param('id') id: string, @Body() data: any, @CurrentUser() user: AuthUser) {
          return this.reviewsService.update(id, data, user.id);
     }

     @Patch('reviews/:id/status')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Approve or Reject review' })
     updateStatus(@Param('id') id: string, @Body('status') status: ReviewStatus) {
          return this.reviewsService.updateStatus(id, status);
     }

     @Delete('reviews/:id')
     @UseGuards(JwtAuthGuard, RolesGuard)
     @Roles(UserRole.SUPER_ADMIN, UserRole.ADMIN)
     @ApiBearerAuth('JWT-auth')
     @ApiOperation({ summary: 'Delete review' })
     delete(@Param('id') id: string) {
          return this.reviewsService.delete(id);
     }
}
