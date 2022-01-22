<template>
    <ul class="file-explorer">
        <li v-for="file in files" :key="file.name" v-text="file.name"></li>
    </ul>
</template>
<script>
    export default {
        name: 'FileExplorer',
        props: ['files']
    }
</script>
<style></style>
