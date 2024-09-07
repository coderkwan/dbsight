<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    $dbs = DB::select('SHOW DATABASES');

    $database_data = [];

    foreach ($dbs as $key => $value) {
        $statement = 'SHOW TABLES FROM ' . $value->Database;
        $tables = DB::select($statement);
        /* dd($tables); */
        array_push($database_data, ['tables' => $tables, 'database' => $value->Database]);
    }

    return view('home', compact('database_data'));
});

Route::get('/data', function (Request $request) {
    $params = $request->query();

    $d = DB::select('SELECT * FROM ' . $params['table']);
    $data = ['data' => $d];

    return response()->json($data);
});


Route::get('/login', function () {
    return view('login');
})->name('login');
