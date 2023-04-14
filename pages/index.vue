<script setup>
const books = ["Fahrenheit 451", "Dijital Kale", "Suç ve Ceza", "1984", "Nutuk", "Ateşten Gömlek"];
// get random value from array books
const randomBook = books[Math.floor(Math.random() * books.length)];
</script>

<template>
  <div>
    <img src="~/assets/library.webp" alt="Kütüphane" class="-z-10 absolute left-0 top-0 h-[90vh] object-cover w-full">
    <div class="absolute left-0 top-0 w-full">
      <div class="flex z-10 flex-row max-w-screen-xl mx-auto w-full py-4">
        <img src="~/assets/smafl.webp" alt="ŞMAFL" class="h-12 w-auto rounded-full mr-auto"/>
        <NuxtLink to="/login" class="z-10 text-gray-100 self-end text-lg px-3 bg-slate-900/30 rounded-lg ml-auto flex flex-row items-center ">
          <icon class="h-12 px-1 text-3xl" name="uil:signin"/> Giriş Yap
        </NuxtLink>
      </div>
    </div>
    <div class="relative flex flex-col items-center justify-center h-[90vh] w-full">
      <div class="absolute left-0 top-0 z-0 bg-gradient-to-t from-slate-900 to-transparant w-full h-[90vh]"/>
      <div class="flex flex-col w-2/5 text-gray-100 text-center drop-shadow-2xl gap-2">
        <h1 class="text-6xl font-bold w-full">Şehit Münir Alkan Fen Lisesi Kütüphanesi</h1>
        <h2 class="text-lg w-full" >Lorem ipsum dolor sit amet, consectetur adipisicing elit.</h2>
      </div>
      <form class="max-w-screen-xl mx-auto w-full">
        <div class="flex md:h-20 h-14 w-full rounded flex-row bg-gray-100 bg-opacity-60 backdrop-blur-lg my-5 rounded-xl z-0">
          <input
            type="text"
            class="mr-auto h-full w-full flex bg-transparent outline-none pl-6 pr-4 py-2 md:text-3xl text-2xl text-slate-800 placeholder:text-slate-600"
            :placeholder="randomBook"
          />
          <button class="flex px-5"><icon class="md:h-8 h-5 px-1 mx-auto my-auto w-auto text-black/50" name="uil:search"/></button>
        </div>
      </form>
    </div>
    <div class="absolute bottom-0 left-0 w-full">
      <div class="max-w-screen-xl mx-auto py-6 w-full flex flex-row items-center justify-between text-gray-100">
        <span class="text-gray-200"><a href="https://enesgenc.dev" target="_blank" class="font-semibold text-gray-100 mr-auto">Enes Genç</a> tarafından yapılmıştır.</span>
        <div>
          <a class="ml-auto text-2xl" href="https://github.com/smafl-yazilim/kutuphane"><icon name="uil:github"/></a>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
body {
  @apply bg-slate-900;
  font-family: Inter, serif;
}
</style>
