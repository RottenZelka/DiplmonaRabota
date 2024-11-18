<?php
use Yiisoft\DataResponse\Middleware\FormatDataResponseAsHtml;
use Yiisoft\DataResponse\Middleware\FormatDataResponseAsJson;
use Yiisoft\Router\Group;
use Yiisoft\Router\Route;
use Yiisoft\Swagger\Middleware\SwaggerUi;
use Yiisoft\Swagger\Action\SwaggerJson;

// Swagger routes
Group::create('/swagger', [
    Route::get('')
        ->middleware(FormatDataResponseAsHtml::class)
        ->action(fn (SwaggerUi $swaggerUi) => $swaggerUi->withJsonUrl('/swagger/json-url')),
    Route::get('/json-url')
        ->middleware(FormatDataResponseAsJson::class)
        ->action(SwaggerJson::class),
]);

