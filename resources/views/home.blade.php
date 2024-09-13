<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @csrf

    <title>Laravel</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    @vite(['resources/css/app.css'])
</head>
<body class="m-4 bg-gray-100">
    <main class="flex gap-4">
        <nav id="sidebar" class="max-w-[20%] w-full border-2 border-slate-300 p-2 overflow-scroll max-h-[95vh]">
            @if (count($dbs) > 0)
                @foreach ($dbs as $key => $item)
                    <div class="side_container">
                        <div class="side_wrapper ">
                            <div onclick="sidebarDropDownClicked(event, {{ $key }}, {{ json_encode($item['Database']) }})"
                                class="side_drop">
                                +</div>
                            <p id="db_{{ $key }}"
                                onclick="getTables(event, {{ json_encode($item['Database']) }}, {{ $key }})"
                                class="db_listed">
                                {{ $item['Database'] }}
                            </p>
                        </div>
                        <div id="tables_{{ $key }}" class="table_listed">
                        </div>
                    </div>
                @endforeach
            @endif
        </nav>
        <div class="border-2 border-slate-300 max-w-[80%] w-full  p-5 overflow-scroll max-h-[95vh]">
            <nav class="bg-slate-200 p-4  uppercase flex gap-5 items-center justify-between mb-3 text-[12px]">
                <div class="flex gap-5 items-center">
                    <button class="border p-2 bg-slate-500 uppercase" onclick="getDbsApi()">Databases</button>
                    <a href="/" class="bg-indigo-400 text-gray-200 px-5 py-2 ">SQL</a>
                    <a href="/" class="bg-indigo-400 text-gray-200 px-5 py-2 ">Import</a>
                    <a href="/" class="bg-indigo-400 text-gray-200 px-5 py-2 ">Export</a>
                </div>
                <div class="flex gap-5 items-center">
                    <a href="/logout" class="bg-black px-4 py-2  text-gray-200">Logout</a>
                </div>
            </nav>
            <div id="displayer" class="">
                <div id="display" class="">
                    <div class="flex flex-wrap gap-3">
                        @foreach ($dbs as $key => $item)
                            <div onclick="getTables(event, {{ json_encode($item['Database']) }}, {{ $key }} )"
                                class="db_card">
                                {{ $item['Database'] }}
                                <p>Tables : {{ $item['table_count'] }}</p>
                                <p>Database size :
                                    {{ number_format($item['database_size'] / 1024 / 1024, 2) }} MBs</p>
                            </div>
                        @endforeach
                    </div>
                </div>
                <form id="create_database_form" action="/create/database" method="post" class="w-full">
                    @csrf
                    <div class="flex gap-2 items-center w-full">
                        <input type="text" name="name" value="{{ old('name') }}" placeholder="database name"
                            class="py-2 px-5  border border-slate-200">
                        <button type="submit"
                            class="py-2 px-5  border text-slate-800 uppercase text-[12px] border-slate-200 bg-green-300">Create
                            Database</button>
                    </div>
                    @foreach ($errors->all() as $error)
                        <p class="text-rose-500 text-sm">{{ $error }}</p>
                    @endforeach
                </form>
            </div>
            <div class="">
                <form id="create_table_modal"
                    class="absolute top-5 mx-auto left-0 right-0 border-indigo-800 shadow-xl border-2 flex justify-center hidden bg-white">
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-bold">Create New Table</h3>
                        <button type="button" id="close_table_modal" class="bg-red-500 w-fit -full pointer">X</button>
                    </div>
                    <p id="create_table_error" class="text-red-500 hidden"> Cannot create table, Please make sure
                        you use a unique name and you columns must contain an 'id' column.</p>
                    <input type="text" name="db" id="create_table_db" required value="{{ old('db') }}"
                        placeholder="table db" hidden>
                    <input type="text" name="name" required value="{{ old('name') }}" placeholder="table name"
                        class="p-2 border">
                    <h3 class="text-xl">Columns</h3>
                    <div class="flex gap-4 flex-col" id="all_columns">
                        <div class="flex gap-5 items-end" id="each_column">
                            <div class="flex flex-col">
                                <label for="">Name</label>
                                <input type="text" name="column[]" required value="id" placeholder="Column name"
                                    class="p-2 border">
                            </div>
                            <div class="flex flex-col">
                                <label for="">Type</label>
                                <select name="type[]" class="p-2">
                                    <option value="INT">INT</option>
                                    <option value="VARCHAR(600)">VARCHAR</option>
                                    <option value="TEXT">TEXT</option>
                                    <option value="DATE">DATE</option>
                                    <option value="DATETIME">DATETIME</option>
                                    <option value="TIMESTAMP">TIMESTAMP</option>
                                    <option value="TIME">TIME</option>
                                    <option value="YEAR">YEAR</option>
                                    <option value="DECIMAL">DECIMAL</option>
                                    <option value="FLOAT">FLOAT</option>
                                    <option value="DOUBLE">DOUBLE</option>
                                    <option value="BOOLEAN">BOOLEAN</option>
                                    <option value="CHAR">CHAR</option>
                                    <option value="BLOB">BLOB</option>
                                    <option value="ENUM">ENUM</option>
                                    <option value="SET">SET</option>
                                    <option value="JSON">JSON</option>
                                    <option value="BIGINT">BIGINT</option>
                                    <option value="TINYINT">TINYINT</option>
                                    <option value="SMALLINT">SMALLINT</option>
                                    <option value="MEDIUMINT">MEDIUMINT</option>
                                    <option value="BIT">BIT</option>
                                    <option value="BINARY">BINARY</option>
                                    <option value="VARBINARY">VARBINARY</option>
                                </select>
                            </div>
                            <div class="flex flex-col">
                                <label>Primary Key</label>
                                <input type="checkbox" name="primary" />
                            </div>
                            <div class="flex flex-col">
                                <label>NULL</label>
                                <select name="NULL[]" class="p-2">
                                    <option value="NULL">Yes</option>
                                    <option value="NOT NULL">No</option>
                                </select>
                            </div>
                            <div class="flex flex-col">
                                <label>Unique</label>
                                <select name="UNIQUE[]" class="p-2">
                                    <option value="NO">No</option>
                                    <option value="YES">Yes</option>
                                </select>
                            </div>
                            <div class="flex flex-col">
                                <label>Default Value</label>
                                <input name="default[]" type="text" class="p-2 border" />
                            </div>
                        </div>
                    </div>
                    <button type="button" id="add_column_btn">Add column +</button>
                    <button type="submit" class="bg-green-500">Create Table</button>
                    @foreach ($errors->all() as $error)
                        <p class="text-rose-500 font-xs">{{ $error }}</p>
                    @endforeach
                </form>
            </div>
        </div>
        </div>
    </main>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
