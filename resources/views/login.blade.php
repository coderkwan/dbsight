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
    <form action="/login" method="post" class="flex flex-col gap-3 w-full max-w-[900px]">
        @csrf
        <label for="">Host</label>
        <input type="text" name="host" placeholder="localhost" required value="{{ old('host') }}">
        <label for="">Username</label>
        <input type="text" name="user" placeholder="admin" required value="{{ old('username') }}">
        <label for="">Password</label>
        <input type="password" name="password" placeholder="1234" required value="{{ old('password') }}">
        <button type="submit">Login</button>
    </form>
</body>
</html>
