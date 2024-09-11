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
            <div id="display">
                <h2 class="text-4xl mb-3 font-bold">Databases</h2>
                <div class="flex flex-wrap gap-3 ">
                    @foreach ($database_data as $key => $item)
                        <div id="db_{{ $key }}" onclick="innerdbClicked(event, {{ $key }})"
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
        </div>
    </main>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
