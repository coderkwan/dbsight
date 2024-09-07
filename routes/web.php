<?php

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $statement = 'SHOW TABLES';
    $statement_db = 'SHOW DATABASES';

    $tables = DB::select($statement);
    $dbs = DB::select($statement_db);
    /* dd($dbs); */

    return view('home', compact('tables', 'dbs'));
});

Route::get('/login', function () {
    return view('login');
})->name('login');
