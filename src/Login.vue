<script setup lang="ts">
// The server redirects back here with ?error=1 after a wrong password.
const hasError = new URLSearchParams(window.location.search).has('error')
</script>

<template>
  <main class="flex min-h-screen items-center justify-center p-4">
    <form method="post" action="/login" class="w-full max-w-xs animate-pop rounded-3xl bg-white p-6 text-center shadow-xl">
      <p class="text-6xl">⭐</p>
      <h1 class="mt-2 text-4xl font-extrabold">Times Tables</h1>
      <p v-if="hasError" class="mt-2 font-bold text-orange-500">Wrong password</p>
      <input
        type="password"
        name="password"
        placeholder="Password"
        aria-label="Password"
        autofocus
        required
        class="mt-4 mb-3 w-full rounded-2xl border-4 border-violet-300 px-4 py-2 text-xl outline-none focus:border-violet-500"
      />
      <button type="submit" class="btn w-full border-violet-600 bg-violet-400">Let's go! 🚀</button>
    </form>
  </main>
</template>
