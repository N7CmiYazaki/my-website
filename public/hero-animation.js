const hero = document.querySelector(".hero");

if (hero) {
  const title = hero.querySelector("#hero-title");
  const phrases = Array.from(hero.querySelectorAll("[data-typewriter]"));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (title && phrases.length > 0 && !reduceMotion.matches) {
    const caret = title.querySelector(".hero-caret");
    const text = phrases.map((phrase) => Array.from(phrase.textContent ?? ""));
    phrases.forEach((phrase) => {
      phrase.textContent = "";
    });
    if (caret) {
      phrases[0].after(caret);
    }
    title.classList.add("is-typing");

    let phraseIndex = 0;
    let characterIndex = 0;
    let typingTimer = 0;

    const typeNextCharacter = () => {
      const phrase = phrases[phraseIndex];
      phrase.textContent += text[phraseIndex][characterIndex];
      characterIndex += 1;

      if (characterIndex < text[phraseIndex].length) {
        typingTimer = window.setTimeout(typeNextCharacter, 95);
        return;
      }

      phraseIndex += 1;
      characterIndex = 0;

      if (phraseIndex < phrases.length) {
        if (caret) {
          phrases[phraseIndex].after(caret);
        }
        typingTimer = window.setTimeout(typeNextCharacter, 180);
      } else {
        title.classList.remove("is-typing");
      }
    };

    const finishTyping = () => {
      window.clearTimeout(typingTimer);
      phrases.forEach((phrase, index) => {
        phrase.textContent = text[index].join("");
      });
      title.classList.remove("is-typing");
    };

    reduceMotion.addEventListener("change", (event) => {
      if (event.matches) {
        finishTyping();
      }
    });
    typingTimer = window.setTimeout(typeNextCharacter, 260);
  }

  const canvas = hero.querySelector(".hero-grid");
  const context = canvas?.getContext("2d");

  if (canvas && context) {
    const spacing = 36;
    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const bounds = hero.getBoundingClientRect();
      const scale = Math.min(window.devicePixelRatio || 1, 2);
      width = bounds.width;
      height = bounds.height;
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      context.setTransform(scale, 0, 0, scale, 0, 0);
    };

    const draw = (time) => {
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.strokeStyle = "rgba(66, 133, 244, 0.09)";
      context.lineWidth = 1;

      for (let x = 0; x <= width; x += spacing) {
        context.moveTo(x, 0);
        context.lineTo(x, height);
      }

      for (let y = 0; y <= height; y += spacing) {
        context.moveTo(0, y);
        context.lineTo(width, y);
      }

      context.stroke();

      const centerX = ((time * 0.018) % (width + spacing)) - spacing;
      const centerY = height * (0.42 + Math.sin(time * 0.00045) * 0.12);
      const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, 130);
      glow.addColorStop(0, "rgba(66, 133, 244, 0.11)");
      glow.addColorStop(1, "rgba(66, 133, 244, 0)");
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);

      const nearestX = Math.round(centerX / spacing) * spacing;
      const nearestY = Math.round(centerY / spacing) * spacing;
      for (let x = nearestX - spacing * 3; x <= nearestX + spacing * 3; x += spacing) {
        for (let y = nearestY - spacing * 3; y <= nearestY + spacing * 3; y += spacing) {
          const distance = Math.hypot(x - centerX, y - centerY);
          if (distance < 110) {
            context.beginPath();
            context.fillStyle = `rgba(52, 168, 83, ${(1 - distance / 110) * 0.32})`;
            context.arc(x, y, 1.8, 0, Math.PI * 2);
            context.fill();
          }
        }
      }
    };

    const animate = (time) => {
      draw(time);
      if (!reduceMotion.matches && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(animate);
      }
    };

    const start = () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      resize();
      draw(0);
      if (!reduceMotion.matches && document.visibilityState === "visible") {
        frame = window.requestAnimationFrame(animate);
      }
    };

    window.addEventListener("resize", start, { passive: true });
    document.addEventListener("visibilitychange", start);
    reduceMotion.addEventListener("change", start);
    start();
  }
}
