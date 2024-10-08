<!DOCTYPE html>

<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    @csrf
    <title>db sight</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="app.css">
</head>
<body class="m-4" id="body">
    <main class="flex gap-4">
        <nav id="sidebar"
            class="rounded-xl max-w-[20%] w-full border border-slate-300 bg-gray-100 p-7 overflow-scroll h-[97vh]">
            @if (count($dbs) > 0)
                @foreach ($dbs as $key => $item)
                    <div class="side_container">
                        <div class="side_wrapper">
                            <div onclick="sidebarDropDownClicked(event, {{ $key }}, {{ json_encode($item['Database']) }})"
                                class="cursor-pointer border border-slate-400 rounded-lg py-2 px-3 bg-white">
                                +</div>
                            <p id="db_{{ $key }}"
                                onclick="getTables(event, {{ json_encode($item['Database']) }}, {{ $key }})"
                                class="db_listed border border-slate-400 rounded-lg py-2 ps-4 w-full bg-white cursor-pointer">
                                {{ $item['Database'] }}
                            </p>
                        </div>
                        <div id="tables_{{ $key }}" class="table_listed">
                        </div>
                    </div>
                @endforeach
            @endif
        </nav>
        <div class="max-w-[80%] w-full h-[85vh]">
            <nav
                class="bg-gray-100 px-7 py-5 border border-slate-300 rounded-xl uppercase flex gap-5 items-center justify-between mb-4 text-[12px]">
                <div class="flex gap-5 items-center">
                    <button
                        class="border border-slate-200 rounded-lg text-slate-700 p-3 bg-white uppercase flex gap-2 items-center"
                        onclick="getDbsApi()">Databases <img src="databasedark.png" alt="databases"
                            class="w-[20px]"></button>
                    <button
                        class="border border-slate-300 rounded-lg text-slate-700 p-3 bg-white uppercase flex gap-2 items-center"
                        onclick="writeRawSQL()">Raw SQL <img src="raw.png" alt="databases" class="w-[20px]"></button>
                </div>
                <div class="flex gap-5 items-center">
                    <a href="/logout"
                        class="border border-slate-200 rounded-lg text-slate-100 p-3 bg-slate-800 uppercase">Logout</a>
                </div>
            </nav>
            <div>
                @if (session('error'))
                    <p class="text-rose-300">
                        {{ session('error') }}
                    </p>
                @endif
            </div>
            <div id="displayer"
                class="overflow-scroll border border-slate-300 rounded-xl px-7 pb-3 bg-gray-100 h-[100%]">
                <form id="create_database_form" action="/create/database" method="post" class="w-full p-0">
                    @csrf
                    <div class="flex gap-2 items-center w-full">
                        <input type="text" name="name" value="{{ old('name') }}" placeholder="database name"
                            class="border border-slate-200 rounded-lg text-slate-700 p-3 bg-white">
                        <button type="submit"
                            class="border border-green-300 rounded-lg text-slate-700 p-3 bg-green-300">Create
                            Database</button>
                    </div>
                    @foreach ($errors->all() as $error)
                        <p class="text-rose-500 text-sm">{{ $error }}</p>
                    @endforeach
                </form>
                <p class="my-3 text-rose-500 hidden" id="global_error"></p>
                <div id="display" class="">
                    <h3 class="text-slate-700 font-bold text-2xl mb-3 uppercase">Databases</h3>
                    <div class="flex flex-wrap gap-3">
                        @foreach ($dbs as $key => $item)
                            <div onclick="getTables(event, {{ json_encode($item['Database']) }}, {{ $key }} )"
                                class="border border-slate-300 p-7 bg-white rounded-xl min-w-[300px] cursor-pointer">
                                <h4 class="font-bold">{{ $item['Database'] }}</h4>
                                <p class="text-blue-600 uppercase text-xs">Tables:
                                    {{ $item['table_count'] }}</p>
                            </div>
                        @endforeach
                    </div>
                </div>
                <div id="raw_sql" style="display: none;" class="h-full">
                    <p class="my-3 text-rose-500 hidden" id="sql_error"></p>
                    <h3 class="flex items-center font-bold text-xl mt-6 mb-3 text-slate-700">Type your valid
                        sql below.
                        <p class="ms-4 text-sm font-normal py-2 px-4 inline bg-fuchsia-200 rounded-full w-fit">
                            State your
                            Database in the
                            quiry.
                            e.g
                            SELECT
                            * FROM database.table;</p>
                    </h3>
                    <form id="raw_sql_form" class="m-0 p-0">
                        <textarea name="sql" cols="10" rows="5"
                            class="m-0 bg-slate-800 text-slate-100 text-lg p-2 border border-slate-200"></textarea>
                        <button type="submit" class="rounded-md">Run SQl</button>
                    </form>
                    <div id="sql_display"
                        class="my-3 h-full w-full overflow-scroll p-4 border border-slate-200 rounded-2xl">
                        <p class="text-xm text-slate-500">YOUR RESULTS WILL APPEAR HERE!</p>
                    </div>
                </div>
            </div>
            <div class="">
                <div
                    id="create_table_modal_wrapper"class="hidden w-screen h-screen absolute top-0 left-0 right-0 bg-[rgba(105,105,105,0.3)]">
                    <form id="create_table_modal"
                        class="rounded-2xl border border-slate-300 max-w-[800px] absolute top-5 left-0 right-0  mx-auto bg-white">
                        <div class="flex items-center justify-between">
                            <h3 class="text-md font-bold" id="create_table_title">Create New Table</h3>
                            <button type="button" id="close_table_modal"
                                class="bg-red-200 w-[40px] h-[40px] rounded-full text-slate-700 cursor-pointer">X</button>
                        </div>
                        <p id="create_table_error" class="text-red-500 hidden"></p>
                        <input type="text" name="db" id="create_table_db" required value="{{ old('db') }}"
                            placeholder="table db" hidden class="p-2 rounded-md border-slate-300">
                        <input type="text" name="name" required value="{{ old('name') }}"
                            placeholder="table name" class="p-2 rounded-md border border-slate-300">
                        <h3 class="text-xl">Columns</h3>
                        <div class="flex gap-5 flex-col" id="all_columns">
                            <div class="flex gap-5 items-end each_column" id="each_column">
                                <div class="flex flex-col">
                                    <label for="">Name</label>
                                    <input type="text" name="column[]" required value="id"
                                        placeholder="Column name" class="p-2 rounded-md border border-slate-300">
                                </div>
                                <div class="flex flex-col">
                                    <label for="">Type</label>
                                    <select name="type[]" class="p-2 rounded-md border border-slate-300">
                                        <option value="INT" selected>INT</option>
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
                                    <label>Size/Values</label>
                                    <input type="text" name="SIZE[]"
                                        class="p-2 rounded-md border border-slate-300" />
                                </div>
                                <div class="flex flex-col">
                                    <label>Primary</label>
                                    <select name="PRIMARY[]" class="p-2 rounded-md border border-slate-300">
                                        <option value="">NO</option>
                                        <option value="PRIMARY KEY" selected>YES</option>
                                    </select>
                                </div>
                                <div class="flex flex-col">
                                    <label>NULL</label>
                                    <select name="NULL[]" class="p-2 rounded-md border border-slate-300">
                                        <option value="NOT NULL">No</option>
                                        <option value="">Yes</option>
                                    </select>
                                </div>
                                <div class="flex flex-col">
                                    <label>Unique</label>
                                    <select name="UNIQUE[]" class="p-2 rounded-md border border-slate-300">
                                        <option value="">No</option>
                                        <option value="UNIQUE" selected>Yes</option>
                                    </select>
                                </div>
                                <div class="flex flex-col">
                                    <label>AI</label>
                                    <select name="AI[]" class="p-2 rounded-md border border-slate-300">
                                        <option value="">No</option>
                                        <option value="AUTO_INCREMENT" selected>Yes</option>
                                    </select>
                                </div>
                                <div class="flex flex-col">
                                    <label>Default</label>
                                    <input name="DEFAULT[]" type="text"
                                        class="p-2 rounded-md border border-slate-300" />
                                </div>
                            </div>
                        </div>
                        <button type="button" id="add_column_btn" class="rounded-md">Add column +</button>
                        <button type="submit" class="bg-green-500 rounded-md">Create Table</button>
                        @foreach ($errors->all() as $error)
                            <p class="text-rose-500 font-xs">{{ $error }}</p>
                        @endforeach
                    </form>
                </div>
                <div id="edit_table_modal_container" class="">
                    <form id="edit_table_modal" class="rounded-2xl border border-slate-300 shadow-lg p-5">
                        <div class="flex items-center justify-between">
                            <h3 class="text-md font-bold" id="create_table_title">Edit Table</h3>
                            <button type="button" id="close_edit_table_modal"
                                class="bg-red-400 w-[40px] h-[40px] pointer rounded-full">X</button>
                        </div>
                        <p id="edit_table_error" class="text-red-500 hidden"></p>
                        <input type="text" name="db" id="edit_table_db" required
                            value="{{ old('db') }}" placeholder="table db" hidden>
                        <input type="text" id="edit_table_old_table" name="old_name" required hidden
                            value="{{ old('old_name') }}" placeholder="table name" class="p-2 border">
                        <div class="flex gap-3">
                            <input type="text" name="name" id="edit_table_table"required
                                value="{{ old('name') }}" placeholder="table name" class="p-2 border rounded-lg">
                            <button type="button" id="save_table_name"
                                class="w-[40%] bg-green-300 rounded-lg text-slate-800">Save
                                name</button>
                        </div>
                        <h3 class="text-xl">Columns</h3>
                        <div class="flex gap-5 flex-col" id="all_edit_columns">
                        </div>
                        <button type="button" id="add_column_on_edit" class="rounded-lg p-2">Add column +</button>
                        @foreach ($errors->all() as $error)
                            <p class="text-rose-500 font-xs">{{ $error }}</p>
                        @endforeach
                    </form>
                </div>
            </div>
            <div id="rename_databese"
                class="hidden absolute w-screen h-screen top-0 right-0 left-0 mx-auto bg-[rgba(105,105,105,0.53)]">
                <div
                    class="flex-col p-3 rounded-2xl border bg-white border-slate-300 absolute mx-auto left-0 right-0 top-5 max-w-[800px]">
                    <button id="close_rename_modal"
                        class="bg-red-400 w-[40px] h-[40px] p-2 self-end text-white rounded-full">X</button>
                    <p id="rename_error" class="my-2 text-rose-300 hidden"></p>
                    <form method="post" id="rename_databese_form" class="w-full">
                        <label>Database Name</label>
                        <input class='p-2 border rounded-lg' name="name" required />
                        <input class='p-2 border' name="old_name" class="hidden" style="display: none;" />
                        <button type="submit" class="rounded-lg p-2 bg-green-300 text-slate-800">Update</button>
                    </form>
                </div>
            </div>
        </div>
        </div>
        {{-- for copy sake --}}
        <div class="hidden gap-5 items-end each_column" id="edit_each_column">
            <div class="flex flex-col">
                <label for="">Name</label>
                <input type="text" name="column[]" required placeholder="Column name"
                    class="p-2 border border-slate-300 rounded-lg">
            </div>
            <div class="flex flex-col">
                <label for="">Type</label>
                <input name="type[]" placeholder="varchar(255)" type="text"
                    class="p-2 border border-slate-300 rounded-lg">
            </div>
            <div class="flex flex-col">
                <label>Primary</label>
                <select name="PRIMARY[]" class="p-2 border border-slate-300 rounded-lg">
                    <option value="">NO</option>
                    <option value="PRIMARY KEY">YES</option>
                </select>
            </div>
            <div class="flex flex-col">
                <label>NULL</label>
                <select name="NULL[]" class="p-2 border border-slate-300 rounded-lg">
                    <option value="NOT NULL">No</option>
                    <option value="">Yes</option>
                </select>
            </div>
            <div class="flex flex-col">
                <label>Unique</label>
                <select name="UNIQUE[]" class="p-2 border border-slate-300 rounded-lg">
                    <option value="">No</option>
                    <option value="UNIQUE">Yes</option>
                </select>
            </div>
            <div class="flex flex-col">
                <label>AI</label>
                <select name="AI[]" class="p-2 border border-slate-300 rounded-lg">
                    <option value="">No</option>
                    <option value="AUTO_INCREMENT">Yes</option>
                </select>
            </div>
            <div class="flex flex-col">
                <label>Default</label>
                <input name="DEFAULT[]" type="text" class="p-2 border border-slate-300 rounded-lg" />
            </div>
        </div>
        {{-- end for copy sake --}}
    </main>
    <script src="{{ asset('js/app.js') }}"></script>
    <script src="{{ asset('js/rows.js') }}"></script>
    <script src="{{ asset('js/table.js') }}"></script>
    <script src="{{ asset('js/db.js') }}"></script>
</body>
</html>
