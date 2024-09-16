<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\DB;

class SetDynamicDbConnection
{
    public function handle($request, Closure $next)
    {

        $cooks = request()->cookie();
        if (isset($cooks['db_connection_details'])) {
            $dbDetails = json_decode($cooks['db_connection_details']);

            Config::set('database.connections.dynamic_db', [
                'driver' => $dbDetails->driver,
                'host' => $dbDetails->host,
                'port' => $dbDetails->port,
                'database' => null,
                'username' => $dbDetails->username,
                'password' => $dbDetails->password ?  $dbDetails->password : "",
            ]);
            DB::purge('dynamic_db'); // Clear the previous connection if exists
            DB::connection('dynamic_db')->reconnect();

            try {
                DB::connection('dynamic_db')->getPdo();
                return $next($request);
            } catch (\Throwable $th) {
                Cookie::expire('db_connection_details');
                return back()->withErrors($th)->withInput(['host' => $dbDetails->host,  'driver' => $dbDetails->driver, 'password' => $dbDetails->password, 'username' => $dbDetails->username, 'port' => $dbDetails->port]);
            }
        } else {
            return redirect('/login');
        }
    }
}
