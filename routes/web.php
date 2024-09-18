<?php

use App\Http\Middleware\SetDynamicDbConnection;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    $db = DB::connection('dynamic_db')->select('SHOW DATABASES');
    /* dd($db); */
    foreach ($db as $key => $value) {

        $statement = 'SHOW TABLES FROM `' . $value->Database . '`';
        $tables = DB::connection('dynamic_db')->select($statement);

        $dbs[] = [
            'Database' => $value->Database,
            'table_count' => count($tables)
        ];
    }

    return view('home', compact('dbs'));
})->name('home')->middleware(SetDynamicDbConnection::class);

Route::get('/home', function () {
    $db = DB::connection('dynamic_db')->select('SHOW DATABASES');
    foreach ($db as $key => $value) {

        $statement = 'SHOW TABLES FROM `' . $value->Database . '`';
        $tables = DB::connection('dynamic_db')->select($statement);

        $dbs[] = [
            'Database' => $value->Database,
            'table_count' => count($tables)
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
    $uni_cols = DB::connection('dynamic_db')->select("SHOW INDEX FROM `"  . $params['db'] .  "`.`" . $params['table'] . "` WHERE Non_unique = 0");


    $columnsArray = [];
    $columnsFull = [];


    foreach ($columns as $column) {
        $column->Unique = false;
        $columnsArray[$column->Field] = $column->Type;

        foreach ($uni_cols as $key) {
            if ($key->Column_name == $column->Field) {
                $column->Unique = true;
            }
        }
    }

    foreach ($columns as $column) {
        $columnsFull[$column->Field] = $column;
    }

    $data = ['data' => $d, 'columns' => $columnsArray, 'columns_full' => $columnsFull];

    return response()->json($data);
})->middleware(SetDynamicDbConnection::class);


Route::post('/delete/row', function (Request $req) {
    $data = $req->input();
    DB::connection('dynamic_db')->select("DELETE FROM `" . $data['db'] . "`.`" . $data['table'] . "` WHERE id=" . $data['id']);
    return response()->json('done');
})->middleware(SetDynamicDbConnection::class);


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

    try {
        DB::connection('dynamic_db')->select("INSERT INTO `" . $data['x_db_'] . "`.`" . $data['x_table_'] . "` ( $k ) VALUES ( $v )");

        return response()->json('Done');
    } catch (\Throwable $th) {
        return response()->json($th->getMessage(), 500);
    }
})->middleware(SetDynamicDbConnection::class);

Route::post('/edit/row', function (Request $req) {
    $data = $req->input();
    $pp = '';
    $pk = DB::connection('dynamic_db')->select("SHOW KEYS FROM `"  . $data['x_db_'] . "`.`" . $data['x_table_'] . "` WHERE Key_name = 'PRIMARY'");

    if (count($pk) > 0) {
        $pp = $pk[0]->Column_name;
    } else {
        return response()->json("Can't determine PRIMARY KEY", 500);
    }

    $k = "";
    foreach ($data as $key => $value) {
        if (substr($key, 0, 2) != "x_" && substr($key, 0, 8) != "all_old_") {
            $k = $k . ", " . "`" . $key . "`= '" . $value . "'";
        }
    }

    $k = substr($k, 1);

    try {
        DB::connection('dynamic_db')->select("UPDATE `" . $data['x_db_'] . "`.`" . $data['x_table_'] . "` SET  $k WHERE $pp='" . $data['all_old_' . $pp] . "'");

        return response()->json('Done');
    } catch (\Throwable $th) {
        return response()->json($th->getMessage(), 500);
    }
})->middleware(SetDynamicDbConnection::class);

function getPrimaryKey($table)
{
    $schemaManager = DB::connection('dynamic_db')->getDoctrineSchemaManager();
    $primaryKey = $schemaManager->listTableDetails($table)->getPrimaryKey();
    if ($primaryKey) {
        return $primaryKey->getColumns()[0];
    }
    return null; // No primary key found
}

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


Route::post('/database/rename', function (Request $req) {
    $data = $req->input();
    $name = trim($data['name']);
    /* $name = str_replace(" ", "_", trim($data['name'])); */

    $host = Config::get('database.connections.dynamic_db.host');
    $username = Config::get('database.connections.dynamic_db.username');
    $password = Config::get('database.connections.dynamic_db.password');
    $port = Config::get('database.connections.dynamic_db.port');

    try {
        DB::connection('dynamic_db')->select("CREATE DATABASE `" . $name . "`");
        $rr = "mysqldump  --ssl-verify-server-cert=0 --host=$host --port=$port --user=$username --password=$password `" . $data['old_name'] . "` | mysql --user=$username --password=$password `$name`";
        exec($rr, $output, $return_var);

        if ($return_var === 0) {
            DB::connection('dynamic_db')->select("DROP DATABASE `" . $data['old_name'] . "`");
        } else {
            DB::connection('dynamic_db')->select("DROP DATABASE `" . $name . "`");
            throw new Exception("There was an error renaming your database! Command: mysqldump Not Found! try doing it in your shell.");
        }

        return response()->json("done");
    } catch (\Throwable $th) {
        return response()->json($th->getMessage(), 500);
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
            $text = $text . " " . $data['type'][$key] . "(" . $data['SIZE'][$key] . ") ";
        } else {
            $text = $text . " " . $data['type'][$key];
        }

        // other options
        if ($data['DEFAULT'][$key] != null && strlen(trim($data['DEFAULT'][$key])) > 0) {
            $text = $text . " " . $data['NULL'][$key] . " " . $data['UNIQUE'][$key] . " "  . $data['AI'][$key] . " DEFAULT '" . $data['DEFAULT'][$key] . "' " . $data['PRIMARY'][$key];
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


Route::post('table/rename', function (Request $req) {
    $data = $req->input();
    try {
        DB::connection('dynamic_db')->select("RENAME TABLE `" . $data['db'] . "`.`" . $data['old_name'] . "` TO `" . $data['db'] . "`.`" . $data['name']  . "`");
        return response()->json('Table successfully renamed!');
    } catch (Throwable $th) {
        return response()->json($th->getMessage(), 401);
    }
})->middleware(SetDynamicDbConnection::class);



Route::post('table/createcolumn', function (Request $req) {
    $data = $req->input();
    $name = $data['column'];
    $type = $data['type'];
    $text = '`' . $name . '` ' . $type;

    foreach ($data as $key => $value) {
        if ($key != 'db' && $key  != 'table' && $key != 'column' && $key != 'type') {
            if ($key == '_default') {
                if (strlen(trim($value)) > 0) {
                    $text = $text . " DEFAULT '" . $value . "'";
                } else {
                }
            } else {
                $text = $text . " " . $value;
            }
        }
    }

    try {
        DB::connection('dynamic_db')->select("ALTER TABLE `" . $data['db'] . "`.`" . $data['table'] . "` ADD COLUMN " . $text);

        return response()->json('Table upated successfully!');
    } catch (Throwable $th) {
        return response()->json($th->getMessage(), 423);
    }
})->middleware(SetDynamicDbConnection::class);



Route::post('table/updatecolumn', function (Request $req) {
    $data = $req->input();
    $text = '';

    foreach ($data as $key => $value) {
        if ($key != 'db' && $key != 'column' && $key  != 'new_name' && $key  != 'table' && $key  != 'db') {
            if ($key == '_default') {
                if (strlen(trim($value)) > 0) {
                    $text = $text . " DEFAULT '" . $value . "'";
                } else {
                }
            } else {
                $text = $text . " " . $value;
            }
        }
    }

    try {
        DB::connection('dynamic_db')->select("ALTER TABLE `" . $data['db'] . "`.`" . $data['table'] . "` CHANGE `" . $data['column'] . "` `" . $data['new_name']  . "` " . $text);

        return response()->json('Table upated successfully!');
    } catch (Throwable $th) {
        return response()->json($th->getMessage(), 423);
    }
})->middleware(SetDynamicDbConnection::class);



Route::post('table/deletecolumn', function (Request $req) {
    $data = $req->input();

    try {
        DB::connection('dynamic_db')->select("ALTER TABLE `" . $data['db'] . "`.`" . $data['table'] . "` DROP COLUMN `" . $data['column'] . "`");

        return response()->json('Table upated successfully!');
    } catch (Throwable $th) {
        return response()->json($th->getMessage(), 423);
    }
})->middleware(SetDynamicDbConnection::class);



Route::post('/delete/table', function (Request $req) {
    $data = $req->input();
    try {
        DB::connection('dynamic_db')->select("DROP TABLE `" . $data['database'] . "`.`" . $data['table'] . "`");
        return response()->json();
    } catch (\Throwable $th) {
        return response()->json($th->getMessage(), 500);
    }
})->middleware(SetDynamicDbConnection::class);


Route::post('/delete/database', function (Request $req) {
    $data = $req->input();
    try {
        DB::connection('dynamic_db')->select("DROP DATABASE `" . $data['database'] . "`");
        return response()->json("Database deleted!");
    } catch (\Throwable $th) {
        return  response()->json($th->getMessage(), 500);
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
        'port' => $request->input('port'),
        /* 'database' => $request->input('database'), */
        'username' => $request->input('user'),
        'password' => $request->input('password'),
    ];

    try {
        $encryptedDbDetails = json_encode($dbDetails);
        Cookie::queue('db_connection_details', $encryptedDbDetails, 60 * 24);
        return redirect('/');
    } catch (\Throwable $th) {
        return back()->withErrors($th->getMessage())->withInput();
    }
});


Route::get('/exportall', function () {
    $host = Config::get('database.connections.dynamic_db.host');
    $username = Config::get('database.connections.dynamic_db.username');
    $password = Config::get('database.connections.dynamic_db.password');
    $port = Config::get('database.connections.dynamic_db.port');
    /* $database = Config::get('database.connections.dynamic_db.database'); */

    $filename = storage_path('app/db_' . date('Ymd_His') . '.sql');
    $command = "mysqldump --ssl-verify-server-cert=0 --host=$host --port=$port --user=$username --password=$password --all-databases > $filename";

    exec($command, $output, $return_var);

    if ($return_var === 0) {
        return response()->download($filename);
    } else {
        session()->flash('error', 'Failed to export Databases!');
        return back();
    }
})->middleware(SetDynamicDbConnection::class);


Route::get('/exportdb', function (Request $req) {
    $db = $req->query('db');
})->middleware(SetDynamicDbConnection::class);
