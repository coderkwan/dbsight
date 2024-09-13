<?php

use App\Http\Middleware\SetDynamicDbConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    $databases = DB::select("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA");
    foreach ($databases as $db) {
        $dbName = $db->SCHEMA_NAME;
        $sizeQuery = "SELECT
                    SUM(data_length + index_length) AS database_size
                  FROM
                    `information_schema`.TABLES
                  WHERE
                    table_schema = '{$dbName}'";

        $tableCountQuery = "SELECT
                          COUNT(*) AS table_count
                        FROM
                          `information_schema`.TABLES
                        WHERE
                          table_schema = '{$dbName}'";

        $sizeResult = DB::connection('dynamic_db')->select($sizeQuery);
        $tableCountResult = DB::connection('dynamic_db')->select($tableCountQuery);

        $dbs[] = [
            'Database' => $dbName,
            'database_size' => $sizeResult[0]->database_size,
            'table_count' => $tableCountResult[0]->table_count
        ];
    }
    return view('home', compact('dbs'));
})->name('home')->middleware(SetDynamicDbConnection::class);

Route::get('/home', function () {
    $databases = DB::select("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA");
    foreach ($databases as $db) {
        $dbName = $db->SCHEMA_NAME;
        $sizeQuery = "SELECT
                    SUM(data_length + index_length) AS database_size
                  FROM
                    `information_schema`.TABLES
                  WHERE
                    table_schema = '{$dbName}'";

        $tableCountQuery = "SELECT
                          COUNT(*) AS table_count
                        FROM
                          `information_schema`.TABLES
                        WHERE
                          table_schema = '{$dbName}'";

        $sizeResult = DB::connection('dynamic_db')->select($sizeQuery);
        $tableCountResult = DB::connection('dynamic_db')->select($tableCountQuery);

        $dbs[] = [
            'Database' => $dbName,
            'database_size' => $sizeResult[0]->database_size,
            'table_count' => $tableCountResult[0]->table_count
        ];
    }
    return response()->json($dbs);
})->middleware(SetDynamicDbConnection::class);


Route::get('/login', function () {
    return view('login');
});


Route::get('/data/tables', function (Request $req) {
    $db = $req->query();
    $tables = "SHOW TABLES FROM `" . $db['database'] . "`";
    $data = DB::connection('dynamic_db')->select($tables);

    return response()->json($data);
})->middleware(SetDynamicDbConnection::class);


Route::get('/data', function (Request $request) {
    $params = $request->query();

    $d = DB::connection('dynamic_db')->select("SELECT * FROM `" . $params['db'] . "`.`" . $params['table'] . "`");

    $columns = DB::connection('dynamic_db')->select("SHOW COLUMNS FROM `" . $params['db'] . "`.`" . $params['table'] . "`");
    $columnsArray = [];
    foreach ($columns as $column) {
        $columnsArray[$column->Field] = $column->Type;
    }

    $data = ['data' => $d, 'columns' => $columnsArray];

    return response()->json($data);
})->middleware(SetDynamicDbConnection::class);


Route::post('/delete/row', function (Request $req) {
    $data = $req->input();
    DB::connection('dynamic_db')->select("DELETE FROM `" . $data['db'] . "`.`" . $data['table'] . "` WHERE id=" . $data['id']);
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

    DB::connection('dynamic_db')->select("INSERT INTO `" . $data['x_db_'] . "`.`" . $data['x_table_'] . "` ( $k ) VALUES ( $v )");

    // fetch fresh data
    $d = DB::connection('dynamic_db')->select("SELECT * FROM `" . $data['x_db_'] . "`.`" . $data['x_table_'] . "`");
    $columns = DB::connection('dynamic_db')->select("SHOW COLUMNS FROM `" . $data['x_table_'] . "`");
    $columnsArray = [];
    foreach ($columns as $column) {
        $columnsArray[$column->Field] = $column->Type;
    }

    $data = ['data' => $d, 'columns' => $columnsArray];

    return response()->json($data);
})->middleware(SetDynamicDbConnection::class);


Route::post('/create/database', function (Request $req) {
    $data = $req->input();
    $name = trim($data['name']);

    try {
        $cr = DB::connection('dynamic_db')->select("CREATE DATABASE IF NOT EXISTS `" . $name . "`");
        return redirect('/');
    } catch (\Throwable $th) {
        return back()->withErrors($th->getMessage())->withInput();
    }
})->middleware(SetDynamicDbConnection::class);


Route::post('/create/table', function (Request $req) {
    $data = $req->input();
    $text = '';
    $col_len = count($data['column']);

    foreach ($data['column'] as $key => $value) {

        $text = $text . $value;

        // type
        if ($data['SIZE'][$key] != null && strlen(trim($data['SIZE'][$key])) > 0) {
            $text = $text . " " . $data['type'][$key] . " (" . $data['SIZE'][$key] . ") ";
        } else {
            $text = $text . " " . $data['type'][$key];
        }

        // other options
        if ($data['DEFAULT'][$key] != null && strlen(trim($data['DEFAULT'][$key])) > 0) {
            $text = $text . " " . $data['NULL'][$key] . " " . $data['UNIQUE'][$key] . " "  . $data['AI'][$key] . " DEFAULT " . $data['DEFAULT'][$key] . " " . $data['PRIMARY'][$key];
        } else {
            $text = $text . " " . $data['NULL'][$key] . " " . $data['UNIQUE'][$key] . " "  . $data['AI'][$key] . " " . $data['PRIMARY'][$key];
        }

        if ($key != $col_len - 1) {
            $text = $text . ", ";
        }
    }

    try {
        DB::connection('dynamic_db')->select("CREATE TABLE `" . $data['db'] . "`.`" . $data['name'] . "` (" . $text . ")");
        return response()->json('done baby');
    } catch (\Throwable $th) {
        return response()->json($th->getMessage(), 401);
    }
})->middleware(SetDynamicDbConnection::class);


Route::post('/delete/table', function (Request $req) {
    $data = $req->input();
    try {
        DB::connection('dynamic_db')->select("DROP TABLE `" . $data['database'] . "`.`" . $data['table'] . "`");
        return response()->json();
    } catch (\Throwable $th) {
        dd($th);
        return response()->json('failed to delete the table!');
    }
})->middleware(SetDynamicDbConnection::class);


Route::post('/delete/database', function (Request $req) {
    $data = $req->input();
    try {
        DB::connection('dynamic_db')->select("DROP DATABASE `" . $data['database'] . "`");
        return response()->json("Database deleted!");
    } catch (\Throwable $th) {
        return response()->json("failed to delete db!");
    }
})->middleware(SetDynamicDbConnection::class);


Route::get('/logout', function () {
    Cookie::expire('db_connection_details');
    return redirect('/');
})->middleware(SetDynamicDbConnection::class);


Route::post('/login', function (Request $request) {
    $dbDetails = [
        'host' => $request->input('host'),
        'driver' => $request->input('driver'),
        /* 'database' => $request->input('database'), */
        'username' => $request->input('user'),
        'password' => $request->input('password'),
    ];

    try {
        $encryptedDbDetails = json_encode($dbDetails);
        Cookie::queue('db_connection_details', $encryptedDbDetails, 60 * 24);
        return redirect('/');
    } catch (\Throwable $th) {
        //throw $th;
        dd($th);
    }
});
