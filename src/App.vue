<template>
  <div>
    <router-view />
  </div>
</template>

<style>
  @import './assets/css/reset.css';
  @import url('https://fonts.googleapis.com/css?family=Baloo+Thambi+2&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@500&display=swap');

  html {
    font-size: 10px;
    background-color: #131313;
    overflow-y: hidden;
  }

  :root {
    --primary-color: #ff344a;
  }

  h1 {
    font-size: 9rem;
    font-weight: 500;
    font-family: 'Poppins';
    color: #e4e4e4;
    letter-spacing: 0.01em;
  }

  h2 {
    font-size: 2.5rem;
    font-weight: 500;
    font-family: 'Poppins';
    color: #e4e4e4;
    letter-spacing: 0.03em;

    margin: 0.5em;
  }

  p {
    font-size: 2rem;
    font-weight: 500;
    font-family: 'Baloo Thambi 2';
    color: #707070;
    letter-spacing: 0.03em;
    text-align: center;

    margin: 0.5em;
  }

  /* Links hover animation. */
  a p {
    transition: color 0.5s;
  }

  a p:hover {
    color: #ff344a;
  }

  /* Global Helpers */
  .g-component-flex {
    height: 100%;
    width: 100%;

    display: flex;
    flex-direction: column;

    align-items: center;
    justify-content: space-between;

    padding: 7rem;
  }

  .g-clickable {
    cursor: pointer;
    user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* Very small smartphones and Samsung Fold. */
  @media only screen and (max-width: 350px) {
    html {
      font-size: 6px;
    }

    h1 {
      font-size: 4rem;
    }

    .g-component-flex {
      padding: 1rem;
    }

    .mobile-hidden {
      display: none !important;
    }
  }

  /* Normal sized smartphones. */
  @media only screen and (min-width: 350px) and (max-width: 900px) {
    html {
      font-size: 6.5px;
    }

    h1 {
      font-size: 4.5rem;
    }

    .g-component-flex {
      padding: 1rem;
    }

    .mobile-hidden {
      display: none !important;
    }
  }

  /* Tablets and laptops. */
  @media only screen and (min-width: 900px) and (max-width: 1600px) {
    html {
      font-size: 7px;
    }

    h1 {
      font-size: 6.5rem;
    }

    .g-component-flex {
      padding: 3rem;
    }
  }

  /* Normal sized desktops. */
  @media only screen and (min-width: 1600px) and (max-width: 2000px) {
    html {
      font-size: 8px;
    }

    .g-component-flex {
      padding: 5rem;
    }
  }

  /* Big desktops. */
  @media only screen and (min-width: 2000px) and (max-width: 3000px) {
    html {
      font-size: 9.5px;
    }

    h1 {
      font-size: 9.5rem;
    }
  }

  /* Horizontal smartphones. */
  @media only screen and (max-height: 500px) {
    html {
      font-size: 3px;
    }

    .g-component-flex {
      padding: 3rem;
    }
  }
</style>
