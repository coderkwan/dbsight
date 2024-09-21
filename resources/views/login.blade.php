<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>db sight</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="app.css">
</head>
<body class="flex flex-col items-center p-5 min-h-[100%vh] justify-between">
    <form action="/login" method="post" class="p-7 bg-gray-100 rounded-xl flex flex-col gap-4 w-full max-w-[500px]">
        @csrf
        <div class="flex flex-col">
            <label for="">Driver</label>
            <select name="driver" placeholder="mysql" required value="{{ old('driver') }}"
                class="border border-slate-300 rounded-lg p-3">
                <option value="mysql">Mysql</option>
                <option value="mariadb">MariaDB</option>
            </select>
        </div>
        <div class="flex flex-col">
            <label for="">Host</label>
            <input type="text" name="host" placeholder="localhost" required value="{{ old('host') }}"
                class="border border-slate-300 rounded-lg p-3">
        </div>
        <div class="flex flex-col">
            <label for="">Port</label>
            <input type="text" name="port" placeholder="3306" required value="{{ old('port') }}"
                class="border border-slate-300 rounded-lg p-3">
        </div>
        <div class="flex flex-col">
            <label for="">Username</label>
            <input type="text" name="user" placeholder="admin" required value="{{ old('username') }}"
                class="border border-slate-300 rounded-lg p-3">
        </div>
        <div class="flex flex-col">
            <label for="">Password</label>
            <input type="password" name="password" placeholder="1234" value="{{ old('password') }}"
                class="border border-slate-300 rounded-lg p-3">
        </div>
        @foreach ($errors->all() as $err)
            <p class="text-rose-400 my-2">{{ $err }}</p>
        @endforeach
        <button type="submit"
            class="rounded-lg bg-indigo-600 p-3 text-white curosor-pointer hover:opacity-75 duration-200">Login</button>
    </form>
    <footer class="flex flex-col items-center">
        <p>DB sight &copy; 2024</p>
        <p>
            Made with coffee by <a href="https://coderkwan.com" class="text-blue-600" target="_blank">coderkwan</a>
            . Want to sponser this project? <a href="https://" class="text-green-600 ">Donate.</a>
        </p>
    </footer>
</body>
</html>
