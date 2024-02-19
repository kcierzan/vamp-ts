<script lang="ts">
  export let title: string;
  export let description: string;
  export let cta: string;
  export let href: string;
</script>

<div class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <h2 class="card-title">{title}</h2>
    <p>{description}</p>
    <div class="card-actions justify-end">
      <a {href} class="btn btn-primary">{cta}</a>
    </div>
  </div>
</div>
