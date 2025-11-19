<?php

use App\Http\Controllers\PlotterEditorController;
use Illuminate\Support\Facades\Route;

Route::get('/kiro-welcome', function () {
    return view('kiro-welcome');
});

Route::get('/example', function () {
    return view('example');
});


Route::get('/original', function () {
    return view('welcome');
});

Route::get('/', [PlotterEditorController::class, 'index']);
