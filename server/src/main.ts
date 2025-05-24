import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import { NextFunction, Request, Response } from 'express';
import * as crypro from "crypto"
global.crypto=crypro as any
declare const module: any;

async function bootstrap() {
  // Create the app as a NestExpressApplication
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);

  app.use(cookieParser());
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({
  //   whitelist: true, // Removes unknown properties
  // forbidNonWhitelisted: true, // Throws an error if unknown properties are sent
  // transform: true, // Transforms the input to match the DTO
  }));

  // Configure CORS
  app.enableCors({
    origin:async(origin,callback)=>{
      
      if (!origin || origin ==='http://localhost:5173') {
        return callback(null, true);
      }
      // Deny any request with an origin different from your website
      callback(new Error('CORS policy: This origin is not allowed'), false);
    }, 
    credentials: true,
  });

  // Serve static files for production
  if (process.env.NODE_ENV=== 'production') {
    app.useStaticAssets(path.join(__dirname, '..', 'website')); // Serve static assets
    app.setBaseViewsDir(path.join(__dirname, '..', 'website')); // Set the base directory for views
    app.getHttpAdapter().get('*', (req:Request, res:Response,next:NextFunction) => {
      if (req.path.startsWith('/api')) {
        return next();
      } else {
        // Serve index.html for non-API routes
      res.sendFile(path.resolve(__dirname, '..', 'website', 'index.html')); // Catch-all for SPA routing
      }
    });
  }

  // Start the application
  const port = process.env.PORT || 5001;
  await app.listen(port);
  console.log(`Server is running on port ${port}`);

  // Hot Module Replacement (HMR)
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();
