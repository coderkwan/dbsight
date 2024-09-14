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
<body class="flex justify-center p-5">
    <form action="/login" method="post" class="p-5 bg-gray-100 flex flex-col w-full max-w-[500px]">
        @csrf
        <label for="">Driver</label>
        <select name="driver" placeholder="mysql" required value="{{ old('driver') }}" class="border px-3 py-1">
            <option value="mysql">Mysql</option>
            <option value="mariadb">MariaDB</option>
        </select>
        <label for="">Host</label>
        <input type="text" name="host" placeholder="localhost" required value="{{ old('host') }}"
            class="border px-3 py-1">
        <label for="">Port</label>
        <input type="text" name="port" placeholder="3306" required value="{{ old('port') }}"
            class="border px-3 py-1">
        {{-- <label for="">Database</label> --}}
        {{-- <input type="text" name="database" placeholder="maindb" required value="{{ old('database') }}" --}}
        {{--     class="border px-3 py-1"> --}}
        <label for="">Username</label>
        <input type="text" name="user" placeholder="admin" required value="{{ old('username') }}"
            class="border px-3 py-1">
        <label for="">Password</label>
        <input type="password" name="password" placeholder="1234" required value="{{ old('password') }}"
            class="border px-3 py-1">
        @foreach ($errors->all() as $err)
            <p class="text-rose-400 my-2">{{ $err }}</p>
        @endforeach
        <button type="submit">Login</button>
    </form>
</body>
</html>
