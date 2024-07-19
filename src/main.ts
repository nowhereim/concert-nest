import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './config/swaggerconfig';
import { SeederService } from './seed/seeder.service';
import { HttpExceptionFilter } from './common/filter/exception.filter';
import { SuccessInterceptor } from './presentation/shared/interceptors/success.interceptor';
import { CustomLogger } from './common/logger/logger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get('Reflector')),
      new SuccessInterceptor(),
    );
    SwaggerModule.setup(
      'api/docs',
      app,
      SwaggerModule.createDocument(app, swaggerConfig),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    const seeder = app.get(SeederService);
    await seeder.seed();
    await app.listen(3000);
  } catch (e) {
    const logger = new CustomLogger();
    logger.logError({ message: e.message, stack: e.stack });
  }
}
bootstrap();
