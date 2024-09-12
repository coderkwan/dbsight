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

            // Set the dynamic connection only if it hasn't been set yet
            if (!Config::has('database.connections.dynamic_db')) {
                Config::set('database.connections.dynamic_db', [
                    'driver' => 'mysql',
                    'host' => $dbDetails->host,
                    'database' => null,
                    'username' => $dbDetails->username,
                    'password' => $dbDetails->password,
                    'charset' => 'utf8mb4',
                    'collation' => 'utf8mb4_unicode_ci',
                    'prefix' => '',
                    'strict' => true,
                    'engine' => null,
                ]);
                DB::purge('dynamic_db'); // Clear the previous connection if exists
            }
            return $next($request);
        } else {
            return redirect('/login');
        }
    }
}
