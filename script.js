const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let cx = 0;
let cy = 0;
let stars = [];
let points = [];
let rotation = 0;
let targetState = "home";
let current = {
  x: 0,
  y: 0,
  scale: 1,
  fill: 0.42,
  line: 0.34,
  alpha: 1
};

const states = {
  home: {
    x: 0,
    y: -10,
    scale: 1.08,
    fill: 0.42,
    line: 0.28,
    alpha: 1
  },
  about: {
    x: 160,
    y: 10,
    scale: 1.55,
    fill: 0.34,
    line: 0.36,
    alpha: 1
  },
  skills: {
    x: 260,
    y: -40,
    scale: 1.75,
    fill: 0.04,
    line: 0.72,
    alpha: 1
  },
  projects: {
    x: 40,
    y: 20,
    scale: 1.35,
    fill: 0.08,
    line: 0.62,
    alpha: 1
  },
  education: {
    x: -220,
    y: 40,
    scale: 1.22,
    fill: 0,
    line: 0.48,
    alpha: 0.86
  },
  certificates: {
    x: 220,
    y: -20,
    scale: 0.95,
    fill: 0,
    line: 0.3,
    alpha: 0.55
  },
  contact: {
    x: 360,
    y: -80,
    scale: 0.72,
    fill: 0,
    line: 0.18,
    alpha: 0.22
  }
};

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  width = window.innerWidth;
  height = window.innerHeight;
  cx = width / 2;
  cy = height / 2;

  canvas.width = width * ratio;
  canvas.height = height * ratio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  createStars();
  createShape();
}

function createStars() {
  stars = Array.from({ length: 150 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.8 + 0.4,
    glow: Math.random() * 0.7 + 0.25,
    speed: Math.random() * 0.18 + 0.04
  }));
}

function createShape() {
  points = [];
  const count = 42;

  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const radius = 185 + Math.sin(i * 2.3) * 46 + Math.random() * 22;

    points.push({
      angle,
      radius,
      z: Math.random() * 240 - 120,
      offset: Math.random() * Math.PI * 2
    });
  }
}

function getActiveSection() {
  const sections = document.querySelectorAll(".section-panel");
  let active = "home";

  sections.forEach((section) => {
    const rect = section.getBoundingClientRect();

    if (rect.top < window.innerHeight * 0.5 && rect.bottom > window.innerHeight * 0.35) {
      active = section.id;
    }
  });

  targetState = states[active] ? active : "home";
}

function lerp(start, end, amount) {
  return start + (end - start) * amount;
}

function updateCurrentState() {
  const target = states[targetState];

  current.x = lerp(current.x, target.x, 0.035);
  current.y = lerp(current.y, target.y, 0.035);
  current.scale = lerp(current.scale, target.scale, 0.035);
  current.fill = lerp(current.fill, target.fill, 0.035);
  current.line = lerp(current.line, target.line, 0.035);
  current.alpha = lerp(current.alpha, target.alpha, 0.035);
}

function drawStars() {
  stars.forEach((star) => {
    star.y += star.speed;

    if (star.y > height) {
      star.y = 0;
      star.x = Math.random() * width;
    }

    ctx.beginPath();
    ctx.fillStyle = `rgba(248, 250, 252, ${star.glow})`;
    ctx.shadowColor = "rgba(34, 211, 238, 0.55)";
    ctx.shadowBlur = 10;
    ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.shadowBlur = 0;
}

function projectPoint(point, index) {
  const wave = Math.sin(rotation * 1.8 + point.offset) * 28;
  const angle = point.angle + rotation;
  const depth = 520 + point.z + Math.cos(rotation + index) * 80;
  const perspective = 520 / depth;
  const radius = (point.radius + wave) * current.scale;

  return {
    x: cx + current.x + Math.cos(angle) * radius * perspective,
    y: cy + current.y + Math.sin(angle) * radius * perspective * 0.82,
    perspective
  };
}

function drawShape() {
  const projected = points.map(projectPoint);

  ctx.save();
  ctx.globalAlpha = current.alpha;

  if (current.fill > 0.01) {
    ctx.beginPath();

    projected.forEach((point, index) => {
      if (index === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });

    ctx.closePath();

    const gradient = ctx.createRadialGradient(
      cx + current.x,
      cy + current.y,
      20,
      cx + current.x,
      cy + current.y,
      380 * current.scale
    );

    gradient.addColorStop(0, `rgba(34, 211, 238, ${current.fill})`);
    gradient.addColorStop(0.4, `rgba(99, 102, 241, ${current.fill * 0.9})`);
    gradient.addColorStop(1, `rgba(6, 59, 109, ${current.fill * 0.45})`);

    ctx.fillStyle = gradient;
    ctx.fill();
  }

  for (let i = 0; i < projected.length; i += 1) {
    for (let j = i + 1; j < projected.length; j += 1) {
      const dx = projected[i].x - projected[j].x;
      const dy = projected[i].y - projected[j].y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 210) {
        const opacity = (1 - distance / 210) * current.line;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(248, 250, 252, ${opacity})`;
        ctx.lineWidth = 1;
        ctx.moveTo(projected[i].x, projected[i].y);
        ctx.lineTo(projected[j].x, projected[j].y);
        ctx.stroke();
      }
    }
  }

  projected.forEach((point) => {
    ctx.beginPath();
    ctx.fillStyle = `rgba(34, 211, 238, ${0.34 * current.alpha})`;
    ctx.shadowColor = "rgba(34, 211, 238, 0.75)";
    ctx.shadowBlur = 12;
    ctx.arc(point.x, point.y, 2.2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
  ctx.shadowBlur = 0;
}

function animate() {
  ctx.clearRect(0, 0, width, height);

  getActiveSection();
  updateCurrentState();

  rotation += 0.0028;

  drawStars();
  drawShape();

  requestAnimationFrame(animate);
}

window.addEventListener("resize", resizeCanvas);

resizeCanvas();
animate();

// Initialize EmailJS
emailjs.init("zDq7v47in6kvAajLZ");

function sendMail() {

  let params = {
    name: document.getElementById("name").value,
    email: document.getElementById("email").value,
    message: document.getElementById("message").value
  };

  emailjs.send("service_3u40htv", "template-4u9gfhq", params)
  .then(function(response) {
      alert("Message sent successfully!");
      console.log(response);
  }, function(error) {
      alert("Failed to send message!");
      console.log(error);
  });

}
