<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class SetDynamicDbConnection
{
    public function handle($request, Closure $next)
    {
        // Check if session has database connection details
        //
        //$request->cookie('name');

        $cooks = request()->cookie();
        if (isset($cooks['db_connection_details'])) {
            $dbDetails = json_decode($cooks['db_connection_details']);

            Config::set('database.connections.dynamic_db', [
                'driver' => $dbDetails->driver,
                'host' => $dbDetails->host,
                'database' => null,
                'username' => $dbDetails->username,
                'password' => $dbDetails->password,
            ]);
            DB::purge('dynamic_db'); // Clear the previous connection if exists
            DB::connection('dynamic_db')->reconnect();
            return $next($request);
        } else {
            return redirect('/login');
        }
    }
}
