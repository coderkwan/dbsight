<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

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
                        @foreach ($item['tables'] as $t_key => $table)
                            <p id="table_{{ $key . '_' . $t_key }}"
                                onclick="tableClicked(event,{{ $t_key }}, {{ $key }})"
                                class="text-sm cursor-pointer border border-slate-400 py-1 px-4 rounded mb-1 hover:border-red-300 hover:bg-orange-100">
                                {{ $table->{'Tables_in_' . $item['database'] . ''} }}</p>
                        @endforeach
                    </div>
                @endforeach
            @endif
        </nav>
        <div class="border border-slate-600 w-full rounded-lg p-5">
            <div id="display"></div>
        </div>
    </main>
    <script src="{{ asset('js/app.js') }}"></script>
</body>
</html>
