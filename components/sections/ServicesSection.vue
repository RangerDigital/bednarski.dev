<template>
  <section class="my-12 flex flex-col flex-nowrap">
    <BaseHeader subtitle="Professional Services">Services</BaseHeader>

    <div class="flex flex-row flex-wrap gap-4 xl:gap-8 justify-center mt-6">
      <BaseCard title="Full-Stack Web Development">
        <p>As a Full-Stack Developer, I craft seamless and scalable web applications from concept to deployment, utilizing advanced frameworks and technologies.</p>
      </BaseCard>

      <BaseCard title="UI/UX Design">
        <p>My design expertise focuses on creating intuitive user interfaces and engaging user experiences, using tools like Figma and Tailwind CSS to bring visions to life.</p>
      </BaseCard>

      <BaseCard title="Tech Consulting">
        <p>Providing expert consulting on web solutions, digital strategies, and technology integration to optimize business processes and performance.</p>
      </BaseCard>

      <BaseCard title="DevOps Solutions">
        <p>Expertise in DevOps practices, focusing on automation, continuous integration (CI), and continuous deployment (CD) to enhance project lifecycle.</p>
      </BaseCard>

      <BaseCard title="IoT Innovations">
        <p>Developing innovative Internet of Things (IoT) solutions that integrate seamlessly with modern web technologies to drive digital transformation.</p>
      </BaseCard>

      <BaseCard title="Project Leadership">
        <p>Providing strategic project management services that deliver projects on time, within budget, and above expectations in technology-driven environments.</p>
      </BaseCard>
    </div>

    <div class="flex flex-row flex-wrap gap-4 justify-center mt-6">
      <p class="max-w-prose text-center"
        >Dedicated to continually enhancing my skill set and adopting innovative tools to maximize efficiency and deliver cutting-edge solutions.</p
      >
    </div>
  </section>
</template>

<script>
  import { defineComponent } from 'vue';

  export default defineComponent({
    name: 'ServicesSection',
  });
</script>
