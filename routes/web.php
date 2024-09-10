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


Route::post('/delete/row', function (Request $req) {
    $data = $req->input();
    DB::select("DELETE FROM " . $data['db'] . "." . $data['table'] . " WHERE id=" . $data['id']);
    return response()->json('done');
});

Route::post('/create/row', function (Request $req) {
    $data = $req->input();
    /* $res = DB::select("INSERT INTO " . $data['db'] . "." . $data['table'] . " WHERE id=" . $data['id']); */
    return response()->json($data);
});
