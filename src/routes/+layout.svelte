<script lang="ts">
  import '$lib/global.css'
  import { supabase } from '$lib/data/supabaseClient'
  import { invalidate } from '$app/navigation'
  import { onMount } from 'svelte'
  import Navbar from "$lib/components/Navbar.svelte";
  import { page } from "$app/stores";

  onMount(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      invalidate('supabase:auth')
    })

    return () => {
      subscription.unsubscribe()
    }
  })
</script>
<div class="container h-screen mx-auto max-w-6xl p-8 2xl:px-0">
  <Navbar session={$page.data.session} />
  <slot />
</div>
