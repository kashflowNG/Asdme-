export const ANIMATED_TEMPLATES = [
  {
    name: "🌌 Cosmic Galaxy",
    description: "Stunning animated galaxy background with floating orbs and twinkling stars",
    badge: "Animated",
    badgeColor: "#8B5CF6",
    category: "animated",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cosmic Galaxy Profile</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(to br, #0a0e27 0%, #1a0033 50%, #0a0e27 100%);
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }
    
    @keyframes float { 
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    
    @keyframes twinkle {
      0%, 100% { opacity: 0.3; }
      50% { opacity: 1; }
    }
    
    .galaxy-bg {
      position: fixed;
      inset: 0;
      pointer-events: none;
      z-index: 0;
    }
    
    .orb {
      position: absolute;
      border-radius: 50%;
      filter: blur(60px);
      opacity: 0.3;
    }
    
    .orb-1 { background: radial-gradient(circle, #8B5CF6, transparent); width: 400px; height: 400px; top: -100px; left: 10%; animation: float 25s ease-in-out infinite; }
    .orb-2 { background: radial-gradient(circle, #06B6D4, transparent); width: 500px; height: 500px; top: 30%; right: 5%; animation: float 30s ease-in-out infinite 5s; }
    .orb-3 { background: radial-gradient(circle, #EC4899, transparent); width: 350px; height: 350px; bottom: -50px; left: 50%; animation: float 28s ease-in-out infinite 10s; }
    
    .star { position: absolute; background: white; border-radius: 50%; }
    
    .container {
      position: relative;
      z-index: 10;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    
    .profile-card {
      background: rgba(30, 41, 59, 0.3);
      backdrop-filter: blur(20px);
      border: 2px solid rgba(139, 92, 246, 0.2);
      border-radius: 30px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 0 40px rgba(139, 92, 246, 0.2);
      animation: float 4s ease-in-out infinite;
    }
    
    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #8B5CF6, #06B6D4);
      margin: 0 auto 20px;
      border: 3px solid rgba(6, 182, 212, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      box-shadow: 0 0 30px rgba(139, 92, 246, 0.4);
    }
    
    h1 {
      color: #fff;
      font-size: 32px;
      margin-bottom: 10px;
      background: linear-gradient(to right, #06B6D4, #8B5CF6);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .bio {
      color: #cbd5e1;
      font-size: 16px;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    
    .links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .link-btn {
      background: linear-gradient(135deg, #8B5CF6, #06B6D4);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
    }
    
    .link-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 30px rgba(6, 182, 212, 0.5);
    }
  </style>
</head>
<body>
  <div class="galaxy-bg">
    <div class="orb orb-1"></div>
    <div class="orb orb-2"></div>
    <div class="orb orb-3"></div>
  </div>
  
  <div class="container">
    <div class="profile-card">
      <div class="avatar">✨</div>
      <h1>Welcome to My World</h1>
      <p class="bio">Explore my cosmic journey through creativity, innovation, and inspiration</p>
      <div class="links">
        <button class="link-btn">🚀 My Projects</button>
        <button class="link-btn">📱 Social Media</button>
        <button class="link-btn">💼 Portfolio</button>
        <button class="link-btn">📧 Contact Me</button>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },
  {
    name: "🔥 Neon Cyberpunk",
    description: "High-energy cyberpunk design with glowing neon lines and animated text",
    badge: "Neon",
    badgeColor: "#EC4899",
    category: "animated",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cyberpunk Profile</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Courier New', monospace;
      background: #0a0a0a;
      color: #fff;
      min-height: 100vh;
      overflow-x: hidden;
      position: relative;
    }
    
    @keyframes scan { 
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100vh); }
    }
    
    @keyframes glow {
      0%, 100% { text-shadow: 0 0 10px #00ff00, 0 0 20px #00ff00; }
      50% { text-shadow: 0 0 20px #00ff00, 0 0 30px #00ff00, 0 0 40px #00ff00; }
    }
    
    .scan-line {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: linear-gradient(to bottom, transparent, #00ff00, transparent);
      animation: scan 8s linear infinite;
      z-index: 1;
    }
    
    .container {
      position: relative;
      z-index: 10;
      max-width: 600px;
      margin: 0 auto;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
    }
    
    .profile-card {
      border: 3px solid #00ff00;
      padding: 40px;
      text-align: center;
      box-shadow: 0 0 30px rgba(0, 255, 0, 0.5), inset 0 0 20px rgba(0, 255, 0, 0.1);
      position: relative;
      overflow: hidden;
      background: rgba(0, 20, 0, 0.5);
    }
    
    .profile-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 30%, rgba(0, 255, 0, 0.1) 50%, transparent 70%);
      animation: scan 3s linear infinite;
    }
    
    .content {
      position: relative;
      z-index: 2;
    }
    
    .avatar {
      width: 100px;
      height: 100px;
      border-radius: 0;
      background: #00ff00;
      margin: 0 auto 20px;
      border: 3px solid #00ff00;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      color: #0a0a0a;
      box-shadow: 0 0 20px #00ff00;
    }
    
    h1 {
      color: #00ff00;
      font-size: 36px;
      margin-bottom: 10px;
      animation: glow 2s ease-in-out infinite;
      letter-spacing: 2px;
    }
    
    .bio {
      color: #00ff00;
      font-size: 14px;
      margin-bottom: 30px;
      opacity: 0.8;
    }
    
    .links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .link-btn {
      background: #00ff00;
      color: #0a0a0a;
      border: 3px solid #00ff00;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      transition: all 0.3s;
      font-family: 'Courier New', monospace;
      box-shadow: 0 0 10px #00ff00;
      letter-spacing: 1px;
    }
    
    .link-btn:hover {
      box-shadow: 0 0 20px #00ff00, inset 0 0 10px rgba(0, 255, 0, 0.5);
      transform: scale(1.02);
    }
  </style>
</head>
<body>
  <div class="scan-line"></div>
  
  <div class="container">
    <div class="profile-card">
      <div class="content">
        <div class="avatar">⚡</div>
        <h1>[SYSTEM ONLINE]</h1>
        <p class="bio">> WELCOME TO MY DIGITAL DOMAIN</p>
        <div class="links">
          <button class="link-btn">> ACCESS PROJECTS</button>
          <button class="link-btn">> VIEW PORTFOLIO</button>
          <button class="link-btn">> CONTACT NETWORK</button>
          <button class="link-btn">> DOWNLOAD CV</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },
  {
    name: "🌸 Glassmorphic Beauty",
    description: "Modern glassmorphism with soft gradients and smooth animations",
    badge: "Modern",
    badgeColor: "#06B6D4",
    category: "animated",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Glassmorphic Profile</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    
    @keyframes float { 
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(2deg); }
    }
    
    @keyframes shimmer {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .container {
      max-width: 500px;
      width: 100%;
    }
    
    .profile-card {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      border-radius: 20px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
      animation: float 6s ease-in-out infinite;
    }
    
    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      margin: 0 auto 20px;
      border: 3px solid rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      box-shadow: 0 8px 15px rgba(31, 38, 135, 0.2);
    }
    
    h1 {
      color: #333;
      font-size: 28px;
      margin-bottom: 10px;
      font-weight: 700;
    }
    
    .bio {
      color: #555;
      font-size: 14px;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    
    .links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .link-btn {
      background: rgba(102, 126, 234, 0.4);
      backdrop-filter: blur(4px);
      -webkit-backdrop-filter: blur(4px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #333;
      padding: 12px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .link-btn:hover {
      background: rgba(102, 126, 234, 0.6);
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(31, 38, 135, 0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile-card">
      <div class="avatar">💫</div>
      <h1>Welcome</h1>
      <p class="bio">Experience the elegance of modern design with smooth animations and beautiful gradients</p>
      <div class="links">
        <button class="link-btn">🎨 My Work</button>
        <button class="link-btn">🔗 Connect</button>
        <button class="link-btn">📚 Learn More</button>
        <button class="link-btn">💌 Contact</button>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },
  {
    name: "✨ Rainbow Gradient",
    description: "Vibrant rainbow gradient with animated color shifts",
    badge: "Colorful",
    badgeColor: "#EC4899",
    category: "animated",
    htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rainbow Profile</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
      background-size: 400% 400%;
      animation: gradient 15s ease infinite;
    }
    
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-30px); }
    }
    
    .container {
      max-width: 500px;
      width: 100%;
    }
    
    .profile-card {
      background: rgba(255, 255, 255, 0.95);
      border-radius: 30px;
      padding: 40px;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: float 4s ease-in-out infinite;
    }
    
    .avatar {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      background: linear-gradient(45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab);
      margin: 0 auto 20px;
      border: 5px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 48px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      background-size: 300% 300%;
      animation: gradient 8s ease infinite;
    }
    
    h1 {
      color: #333;
      font-size: 32px;
      margin-bottom: 10px;
      font-weight: 800;
      background: linear-gradient(45deg, #ee7752, #e73c7e, #23a6d5);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    
    .bio {
      color: #666;
      font-size: 15px;
      margin-bottom: 30px;
      line-height: 1.6;
    }
    
    .links {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .link-btn {
      background: linear-gradient(45deg, #ee7752, #e73c7e, #23a6d5);
      color: white;
      border: none;
      padding: 14px 24px;
      border-radius: 12px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      background-size: 300% 300%;
      animation: gradient 6s ease infinite;
    }
    
    .link-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="profile-card">
      <div class="avatar">🌈</div>
      <h1>Hello World</h1>
      <p class="bio">Celebrate diversity and creativity with vibrant colors and positive energy</p>
      <div class="links">
        <button class="link-btn">🎯 Discover</button>
        <button class="link-btn">💫 Explore</button>
        <button class="link-btn">🚀 Innovate</button>
        <button class="link-btn">🎉 Join Us</button>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  },
];
