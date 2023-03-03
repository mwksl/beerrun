<script lang="ts">
	import { supabase } from '../data/supabaseClient';

	export let session;
	let loading = false;

	async function signOut() {
		try {
			let { error } = await supabase.auth.signOut();
			if (error) throw error;
		} catch (error) {
			if (error instanceof Error) {
				alert(error.message);
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class="navbar bg-base-100">
	<div class="flex-1">
		<a class="btn btn-ghost normal-case text-xl">Beer Run</a>
	</div>
	<div class="flex-none gap-2">
		{#if session}
			<div class="dropdown dropdown-end">
				<label tabindex="0" class="btn btn-ghost btn-circle avatar">
					<div class="w-10 rounded-full">
						<!-- add a random cat photo -->
						<img src="https://placekitten.com/200/200" alt="avatar" class="rounded-full" />
					</div>
				</label>
				<ul
					tabindex="0"
					class="mt-3 p-2 shadow menu menu-compact dropdown-content bg-base-100 rounded-box w-52"
				>
					<li>
						<a class="justify-between">
							Profile
							<span class="badge">New</span>
						</a>
					</li>
					<li><a href="/settings">Settings</a></li>
					<li>
						<button on:click={signOut} disabled={loading}>Sign Out</button>
					</li>
				</ul>
			</div>
		{:else}
			<!-- @TODO: add a login button -->
			<!--<a href="/login" class="btn btn-ghost">Login</a>-->
		{/if}
	</div>
</div>
