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
<body class="m-4">
    <main class="flex gap-4">
        <nav class="max-w-[400px]">
            @if (count($database_data) > 0)
                @foreach ($database_data as $key => $item)
                    <p id="db_{{ $key }}" onclick="dbClicked(event, {{ $key }})"
                        class="flex items-center cursor-pointer font-bold text-xl border border-slate-400 py-2 px-4 rounded mb-3 hover:border-red-300 hover:bg-orange-200 ">
                        <span class="px-2 rounded me-2 bg-green border border-slate-400 text-slate-400">></span>
                        {{ $item['database'] }}
                    </p>
                    <div id="tables_{{ $key }}" class="ms-5 hidden">
                        <button class="text-xs mb-2">New Table</button>
                        <button class="text-xs mb-2 bg-rose-300">Delete Database</button>
                        @foreach ($item['tables'] as $t_key => $table)
                            <div id="{{ $item['database'] }}" class="flex gap-2 items-center justify-between">
                                <p id="table_{{ $key . '_' . $t_key }}"
                                    onclick="tableClicked(event,{{ $t_key }}, {{ $key }})"
                                    class="w-full text-sm cursor-pointer border border-slate-400 py-1 px-4 rounded mb-1 hover:border-red-300 hover:bg-orange-100">
                                    {{ $table->{'Tables_in_' . $item['database'] . ''} }}</p>
                                <span class="bg-fuchsia-300 py-2 px-5 cursor-pointer rounded text-xs">Edit</span>
                                <span class="bg-rose-400 py-2 px-5 cursor-pointer rounded text-xs">Detele</span>
                            </div>
                        @endforeach
                    </div>
                @endforeach
            @endif
        </nav>
        <div class="border border-slate-600 w-full rounded-lg p-5">
            <nav class="bg-slate-200 p-2 rounded flex gap-5 items-center justify-between mb-5">
                <div class="flex gap-5 items-center">
                    <a href="/" class="bg-indigo-300 px-4 py-1 rounded">Databases</a>
                    <a href="/" class="bg-indigo-300 px-4 py-1 rounded">SQL</a>
                    <a href="/" class="bg-indigo-300 px-4 py-1 rounded">Import</a>
                    <a href="/" class="bg-indigo-300 px-4 py-1 rounded">Export</a>
                </div>

                <div class="flex gap-5 items-center">
                    <a href="/" class="bg-pink-300 px-4 py-1 rounded">Logout</a>
                </div>
            </nav>
            <div id="display">
                <h2 class="text-4xl mb-3 font-bold">Databases</h2>
                <div class="flex flex-wrap gap-3 ">
                    @foreach ($database_data as $key => $item)
                        <div id="db_{{ $key }}" data-tables="{{ json_encode($item['tables']) }}"
                            onclick="innerDBClicked(event, {{ json_encode($item['tables']) }} )"
                            class="flex items-center cursor-pointer font-bold text-xl border border-slate-400 py-2 px-4 rounded mb-3 hover:border-red-300 hover:bg-orange-200 ">
                            {{ $item['database'] }}
                        </div>
                    @endforeach
                </div>
                <div>
                    <form action="/create/database" method="post">
                        @csrf
                        <input type="text" name="name" value="{{ old('name') }}" placeholder="database name">
                        <button type="submit">Create Database</button>
                        @foreach ($errors->all() as $error)
                            <p class="text-rose-500 font-xs">{{ $error }}</p>
                        @endforeach
                    </form>
                </div>
            </div>
            <div class="">
                <form action="/create/table" method="post" id="create_table_modal"
                    class="absolute top-5 mx-auto left-0 right-0 border-indigo-800 shadow-xl border-2 flex justify-center hidden">
                    @csrf
                    <div class="flex items-center justify-between">
                        <h3 class="text-2xl font-bold">Create New Table</h3>
                        <button type="button" id="close_table_modal"
                            class="bg-red-500 w-fit rounded-full pointer">X</button>
                    </div>
                    <input type="text" name="db" id="create_table_db" required value="{{ old('db') }}"
                        placeholder="table db" hidden>
                    <input type="text" name="name" required value="{{ old('name') }}" placeholder="table name">
                    <h3 class="text-xl">Columns</h3>
                    <div class="flex gap-4 flex-col" id="all_columns">
                        <div class="flex gap-5 items-end" id="each_column">
                            <div class="flex flex-col">
                                <label for="">Name</label>
                                <input type="text" name="column[]" required value="id" placeholder="Column name">
                            </div>
                            <div class="flex flex-col">
                                <label for="">Type</label>
                                <select name="type[]" class="p-2">
                                    <option value="INT">INT</option>
                                    <option value="VARCHAR">VARCHAR</option>
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
                                <label>NUll</label>
                                <select name="NULL[]" class="p-2">
                                    <option value="yes">Yes</option>
                                    <option value="no">No</option>
                                </select>
                            </div>
                            <div class="flex flex-col">
                                <label>Default Value</label>
                                <input name="default[]" type="text" />
                            </div>
                        </div>
                    </div>
                    <button type="button" id="add_column_btn">Add column +</button>
                    <button type="submit">Create Table</button>
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
