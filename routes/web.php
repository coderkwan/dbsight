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
})->name('home');

Route::get('/data', function (Request $request) {
    $params = $request->query();

    $d = DB::select('SELECT * FROM ' . $params['db'] . '.' . $params['table']);
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
    $k = "";
    $v = "";

    foreach ($data as $key => $value) {
        if (substr($key, 0, 2) != "x_") {
            $k = $k . ", " . "`" . $key . "`";
            $v = $v . "," .  "'" . $value . "'";
        }
    }

    $k = substr($k, 1);
    $v = substr($v, 1);

    DB::select("INSERT INTO " . $data['x_db_'] . "." . $data['x_table_'] . " ( $k ) VALUES ( $v )");
    return response()->json("done");
});



Route::post('/create/database', function (Request $req) {
    $data = $req->input();
    $name = str_replace(" ", "_", $data['name']);

    try {
        DB::select("CREATE DATABASE  " . $name);
        return redirect('/');
    } catch (\Throwable $th) {
        return back()->withErrors("Can't create databse, choose a different name!")->withInput();
    }
});

Route::post('/create/table', function (Request $req) {
    $data = $req->input();
    $text = '';
    $col_len = count($data['column']);

    foreach ($data['column'] as $key => $value) {
        $text = $text . $value . " " . $data['type'][$key];
        if ($key != $col_len - 1) {
            $text = $text . ", ";
        }
    }

    try {
        DB::select("CREATE TABLE " . $data['db'] . "." . $data['name'] . " (" . $text . ")");
        return response()->json('done baby');
    } catch (\Throwable $th) {
        return response()->json('Failed create the table, make sure the name is unique and your columns include an id column', 400);
    }
});

Route::post('/delete/table', function (Request $req) {
    $data = $req->input();
    try {
        DB::select("DROP TABLE " . $data['database'] . "." . $data['table']);
        return response()->json();
    } catch (\Throwable $th) {
        return response()->json('failed to delete the table!');
    }
});

Route::post('/delete/database', function (Request $req) {
    $data = $req->input();
    try {
        DB::select("DROP DATABASE " . $data['database']);
        return response()->json("Database deleted!");
    } catch (\Throwable $th) {
        return response()->json("failed to delete db!");
    }
});
