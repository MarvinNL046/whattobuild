"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";

const SENDER = "WhatToBuild <noreply@whattobuild.com>";
const ADMIN_EMAIL = "hello@wetryleadflow.com";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://whattobuild.com";

export const sendMonitoringEmail = internalAction({
  args: {
    to: v.string(),
    niche: v.string(),
    queryId: v.id("queries"),
    painPoints: v.array(v.object({
      title: v.string(),
      description: v.string(),
    })),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY — skipping email");
      return;
    }

    const resultsUrl = `${BASE_URL}/results/${args.queryId}`;
    const top3 = args.painPoints.slice(0, 3);

    const painPointsHtml = top3
      .map((pp, i) => `<li><strong>${i + 1}. ${pp.title}</strong><br/><span style="color:#6b7280">${pp.description}</span></li>`)
      .join("");

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#111">New insights for "${args.niche}"</h2>
        <p>Your weekly niche monitoring found new pain points:</p>
        <ol style="padding-left:20px">${painPointsHtml}</ol>
        <p style="margin-top:24px">
          <a href="${resultsUrl}" style="background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
            View full results
          </a>
        </p>
        <p style="margin-top:32px;font-size:12px;color:#9ca3af">
          You're receiving this because you're monitoring "${args.niche}" on WhatToBuild.
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: SENDER,
        to: [args.to],
        subject: `New insights for "${args.niche}"`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Resend error: ${response.status} - ${error}`);
    }
  },
});

export const sendWelcomeEmail = internalAction({
  args: {
    to: v.string(),
    name: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY — skipping email");
      return;
    }

    const dashboardUrl = `${BASE_URL}/dashboard`;
    const greeting = args.name ? `Hi ${args.name},` : "Hi there,";

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#111">Welcome to WhatToBuild!</h2>
        <p>${greeting}</p>
        <p>You've got <strong>3 free credits</strong> to start discovering real pain points and product opportunities.</p>
        <p>Here's how it works:</p>
        <ol style="padding-left:20px;color:#374151">
          <li><strong>Enter a niche</strong> — like "home fitness" or "email tools"</li>
          <li><strong>We scrape thousands of real conversations</strong> across Reddit, Quora, reviews, and forums</li>
          <li><strong>AI analyzes the pain points</strong> and ranks them with search volume, competition data, and product ideas</li>
        </ol>
        <p style="margin-top:24px">
          <a href="${dashboardUrl}" style="background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
            Start your first research
          </a>
        </p>
        <p style="margin-top:32px;font-size:12px;color:#9ca3af">
          You're receiving this because you signed up for WhatToBuild.
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: SENDER,
        to: [args.to],
        subject: "Welcome to WhatToBuild — 3 free credits inside",
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Resend error: ${response.status} - ${error}`);
    }
  },
});

export const sendNoCreditsEmail = internalAction({
  args: {
    to: v.string(),
    niche: v.string(),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY — skipping email");
      return;
    }

    const creditsUrl = `${BASE_URL}/settings`;

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#111">Monitoring paused — out of credits</h2>
        <p>Your weekly monitoring for "<strong>${args.niche}</strong>" couldn't run because you don't have enough credits.</p>
        <p>Each monitoring run uses 1 credit. Top up your credits to keep receiving weekly insights.</p>
        <p style="margin-top:24px">
          <a href="${creditsUrl}" style="background:#111;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
            Buy credits
          </a>
        </p>
        <p style="margin-top:32px;font-size:12px;color:#9ca3af">
          You're receiving this because you're monitoring "${args.niche}" on WhatToBuild.
        </p>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: SENDER,
        to: [args.to],
        subject: `Monitoring paused — out of credits`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Resend error: ${response.status} - ${error}`);
    }
  },
});

export const sendNewSignupNotification = internalAction({
  args: {
    userEmail: v.string(),
    userName: v.optional(v.string()),
  },
  handler: async (_ctx, args) => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY — skipping email");
      return;
    }

    const displayName = args.userName ?? "Unknown";
    const now = new Date().toLocaleString("en-US", { timeZone: "Europe/Amsterdam" });

    const html = `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <h2 style="color:#111">New sign-up on WhatToBuild</h2>
        <table style="border-collapse:collapse;margin-top:16px">
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Name</td><td style="padding:4px 0"><strong>${displayName}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Email</td><td style="padding:4px 0"><strong>${args.userEmail}</strong></td></tr>
          <tr><td style="padding:4px 12px 4px 0;color:#6b7280">Time</td><td style="padding:4px 0">${now}</td></tr>
        </table>
      </div>
    `;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: SENDER,
        to: [ADMIN_EMAIL],
        subject: `New sign-up: ${displayName} (${args.userEmail})`,
        html,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`Resend error: ${response.status} - ${error}`);
    }
  },
});
