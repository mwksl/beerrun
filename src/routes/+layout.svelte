<script lang="ts">
	import '$lib/global.css';
	import { supabase } from '$lib/data/supabaseClient';
	import { invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import Navbar from '$lib/components/Navbar.svelte';
	import { page } from '$app/stores';

	onMount(() => {
		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange(() => {
			invalidate('supabase:auth');
		});

		return () => {
			subscription.unsubscribe();
		};
	});
</script>

<div class="h-screen w-screen font-mono">
	<div class="container mx-auto h-full w-full px-4">
		<Navbar session={$page.data.session} />

		<slot />
		<footer class="footer items-center p-4 bg-neutral text-neutral-content">
			<div class="items-center grid-flow-col">
				<p>
					Built with <span class="daisy-footer__heart">❤️</span> by
					<a class="link" href="https://mwksl.me">Matthew Stingel</a> in Denver, CO 🏔
				</p>
			</div>
			<div class="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
				<p>&copy; 2023 Beer Run</p>
			</div>
		</footer>
	</div>
	<script
		data-name="BMC-Widget"
		data-cfasync="false"
		src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
		data-id="mwksl"
		data-description="Support me on Buy me a coffee!"
		data-message=""
		data-color="#5F7FFF"
		data-position="Left"
		data-x_margin="18"
		data-y_margin="18"
	></script>
</div>
