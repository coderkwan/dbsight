<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Laravel</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet" />

</head>
<body class="">
    <form action="/auth" method="post">
        @csrf
        <input type="text" name="username" placeholder="username" required value="{{ old('username') }}">
        <input type="password" name="password" placeholder="password" required value="{{ old('password') }}">
        <button type="submit">Login</button>
    </form>
</body>
</html>
