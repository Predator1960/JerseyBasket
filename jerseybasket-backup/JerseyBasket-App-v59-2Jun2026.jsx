/**
 * ============================================================
 * JerseyBasket.je — Channel Islands Grocery Price Comparison
 * ============================================================
 * Copyright © 2026 Eamonn O'Shea. All Rights Reserved.
 *
 * This source code is the proprietary and confidential
 * property of Eamonn O'Shea. Unauthorised copying,
 * modification, distribution, or use of this software,
 * via any medium, is strictly prohibited without the
 * express written permission of the owner.
 *
 * Built for Jersey, Channel Islands.
 * Contact: hello@jerseybasket.je
 *
 * Version:   v59
 * Updated:   2 June 2026
 * Changes:   Category sort — grouped headers A-Z, fixed category data typos, category badge on product cards
 * ============================================================
 */
import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   STORES
═══════════════════════════════════════════════════════════════════════════ */
const STORES = [
  { id:"coop",      name:"CI Co-op",  short:"Co-op",    tag:"Best Value", color:"#16a34a", emoji:"🌿", note:"Grande Marché, St Peter & branches" },
  { id:"morrisons", name:"Morrisons", short:"Morrisons",tag:"Convenience",color:"#eab308", emoji:"🛒", note:"The Parade, Benest's & branches" },
  { id:"ms",        name:"M&S Food",  short:"M&S",      tag:"Premium",    color:"#94a3b8", emoji:"✨", note:"St Helier (SandpiperCI)" },
  { id:"waitrose",  name:"Waitrose",  short:"Waitrose", tag:"Organic",    color:"#0d9488", emoji:"🌱", note:"St Saviour" },
  { id:"iceland",   name:"Iceland",   short:"Iceland",  tag:"Frozen",     color:"#dc2626", emoji:"🧊", note:"St Ouen & Broad St (via Alliance)" },
];

/* ═══════════════════════════════════════════════════════════════════════════
   CATEGORIES
═══════════════════════════════════════════════════════════════════════════ */
const CATS = [
  "All","🥛 Dairy & Eggs","🍞 Bread & Bakery","🥩 Meat & Fish",
  "🥦 Fruit & Veg","🧊 Frozen","🥤 Drinks","🍝 Pantry","🥨 Snacks & Treats",
  "🧹 Household","💊 Health & Beauty","🍼 Baby & Child",
  "🐾 Pet Care","🌱 Free From","🥔 Local Jersey","➕ Custom",
];

/* helper — spread prices from a base. Order: [coop, morrisons, ms, waitrose, iceland] */
const sp = (base,[c,m,ms2,w,i]) => ({
  coop:      Math.max(0,+(base+c  ).toFixed(2)),
  morrisons: Math.max(0,+(base+m  ).toFixed(2)),
  ms:        Math.max(0,+(base+ms2).toFixed(2)),
  waitrose:  Math.max(0,+(base+w  ).toFixed(2)),
  iceland:   Math.max(0,+(base+i  ).toFixed(2)),
});

/* ═══════════════════════════════════════════════════════════════════════════
   PRODUCT DATABASE  (300 + items)
═══════════════════════════════════════════════════════════════════════════ */
const BASE_PRODUCTS = [

  /* ── DAIRY & EGGS ─────────────────────────────────────────────── */
  {id:1,  name:"Full Fat Milk (2L)",           cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.75,[1.53,0.14,0.35,0.24,0.07])},
  {id:2,  name:"Semi-Skimmed Milk (2L)",       cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.70,[1.58,-0.05,0.34,0.24,0.07])},
  {id:3,  name:"Skimmed Milk (2L)",            cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.65,[0,0.13,0.3,0.22,0.07])},
  {id:4,  name:"Oat Milk (1L)",                cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.60,[0,0.2,0.7,0.5,0.1])},
  {id:5,  name:"Almond Milk (1L)",             cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.55,[0,0.2,0.7,0.5,0.1])},
  {id:6,  name:"Soya Milk (1L)",               cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.45,[0,0.18,0.65,0.48,0.09])},
  {id:7,  name:"Coconut Milk Drink (1L)",      cat:"🥛 Dairy & Eggs", icon:"🥛", prices:sp(1.65,[0,0.22,0.72,0.52,0.11])},
  {id:8,  name:"Free Range Eggs (6pk)",        cat:"🥛 Dairy & Eggs", icon:"🥚", prices:sp(1.85,[0,0.2,0.64,0.5,0.1])},
  {id:9,  name:"Free Range Eggs (12pk)",       cat:"🥛 Dairy & Eggs", icon:"🥚", prices:sp(3.40,[0,0.3,1,0.8,0.15])},
  {id:10, name:"Cheddar Mature (400g)",        cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.80,[0.90,0.00,0.6,0.4,0.07])},
  {id:11, name:"Cheddar Mild (400g)",          cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.60,[0,0.14,0.55,0.38,0.07])},
  {id:12, name:"Mozzarella (125g)",            cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(1.10,[0,0.15,0.45,0.35,0.07])},
  {id:13, name:"Brie (200g)",                  cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.20,[0,0.2,0.8,0.6,0.1])},
  {id:14, name:"Parmesan (100g)",              cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.50,[0,-0.40,0.95,0.75,0.12])},
  {id:15, name:"Feta Cheese (200g)",           cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:16, name:"Butter Salted (250g)",         cat:"🥛 Dairy & Eggs", icon:"🧈", prices:sp(2.20,[0.15,0.15,0.6,0.45,0.07])},
  {id:17, name:"Butter Unsalted (250g)",       cat:"🥛 Dairy & Eggs", icon:"🧈", prices:sp(2.25,[0.10,0.15,0.6,0.45,0.07])},
  {id:18, name:"Spreadable Butter (500g)",     cat:"🥛 Dairy & Eggs", icon:"🧈", prices:sp(3.10,[1.45,0.22,0.85,0.65,0.11])},
  {id:19, name:"Greek Yoghurt (500g)",         cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.95,[0,0.05,0.65,0.45,0.07])},
  {id:20, name:"Natural Yoghurt (500g)",       cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.60,[0,0.15,0.55,0.4,0.07])},
  {id:21, name:"Fruit Yoghurts 4pk",           cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.80,[0,0.18,0.7,0.52,0.09])},
  {id:22, name:"Sour Cream (300ml)",           cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.40,[0,0.15,0.6,0.45,0.07])},
  {id:23, name:"Crème Fraîche (300ml)",        cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.60,[0,0.18,0.65,0.5,0.09])},
  {id:24, name:"Double Cream (300ml)",         cat:"🥛 Dairy & Eggs", icon:"🍦", prices:sp(1.60,[0,0.2,0.7,0.55,0.1])},
  {id:25, name:"Single Cream (300ml)",         cat:"🥛 Dairy & Eggs", icon:"🍦", prices:sp(1.45,[0,0.18,0.65,0.5,0.09])},
  {id:26, name:"Cottage Cheese (300g)",        cat:"🥛 Dairy & Eggs", icon:"🫙", prices:sp(1.50,[0,1.10,0.6,0.45,0.07])},
  {id:27, name:"Cream Cheese (200g)",          cat:"🥛 Dairy & Eggs", icon:"🧀", prices:sp(1.80,[0.85,0.18,0.7,0.52,0.09])},
  {id:28, name:"Clotted Cream (113g)",         cat:"🥛 Dairy & Eggs", icon:"🍦", prices:sp(2.00,[0,0.22,0.8,0.6,0.11])},

  /* ── BREAD & BAKERY ───────────────────────────────────────────── */
  {id:29, name:"White Sliced Bread 800g",      cat:"🍞 Bread & Bakery",icon:"🍞", prices:sp(1.25,[0.50,-0.51,0.55,0.4,0.05])},
  {id:30, name:"Wholemeal Bread 800g",         cat:"🍞 Bread & Bakery",icon:"🥖", prices:sp(1.45,[0,0.1,0.55,0.4,0.05])},
  {id:31, name:"Seeded Batch Loaf",            cat:"🍞 Bread & Bakery",icon:"🥖", prices:sp(1.75,[-0.20,0.15,0.65,0.5,0.07])},
  {id:32, name:"Sourdough Loaf",               cat:"🍞 Bread & Bakery",icon:"🥖", prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:33, name:"Gluten Free White Bread",      cat:"🍞 Bread & Bakery",icon:"🍞", prices:sp(2.90,[0,0.28,1,0.8,0.14])},
  {id:34, name:"Croissants (4pk)",             cat:"🍞 Bread & Bakery",icon:"🥐", prices:sp(1.80,[0,0.15,0.7,0.5,0.07])},
  {id:35, name:"Pain au Chocolat (4pk)",       cat:"🍞 Bread & Bakery",icon:"🥐", prices:sp(1.95,[0,0.2,0.8,0.6,0.1])},
  {id:36, name:"Bagels (5pk)",                 cat:"🍞 Bread & Bakery",icon:"🥯", prices:sp(1.50,[0,0.2,0.7,0.55,0.1])},
  {id:37, name:"Pitta Bread (6pk)",            cat:"🍞 Bread & Bakery",icon:"🫓", prices:sp(1.20,[0,-0.70,0.65,0.5,0.07])},
  {id:38, name:"Wraps / Tortillas (8pk)",      cat:"🍞 Bread & Bakery",icon:"🫓", prices:sp(1.60,[0,-0.20,0.7,0.55,0.07])},
  {id:39, name:"Naan Bread (4pk)",             cat:"🍞 Bread & Bakery",icon:"🫓", prices:sp(1.50,[0,0.19,0.65,0.5,0.07])},
  {id:40, name:"English Muffins (6pk)",        cat:"🍞 Bread & Bakery",icon:"🥯", prices:sp(1.40,[0,0.14,0.6,0.46,0.07])},
  {id:41, name:"Hot Dog Rolls (6pk)",          cat:"🍞 Bread & Bakery",icon:"🍞", prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:42, name:"Burger Buns (4pk)",            cat:"🍞 Bread & Bakery",icon:"🍞", prices:sp(1.25,[0,0.12,0.52,0.4,0.06])},
  {id:43, name:"Ciabatta Rolls (4pk)",         cat:"🍞 Bread & Bakery",icon:"🥖", prices:sp(1.80,[0,0.18,0.72,0.55,0.09])},
  {id:44, name:"Crumpets (6pk)",               cat:"🍞 Bread & Bakery",icon:"🫓", prices:sp(1.10,[0.39,0.40,0.48,0.36,0.06])},
  {id:45, name:"Pancakes (6pk)",               cat:"🍞 Bread & Bakery",icon:"🥞", prices:sp(1.40,[0,0.14,0.58,0.44,0.07])},
  {id:46, name:"Waffles (6pk)",                cat:"🍞 Bread & Bakery",icon:"🧇", prices:sp(1.60,[0,0.16,0.62,0.47,0.08])},
  {id:47, name:"Scones (4pk)",                 cat:"🍞 Bread & Bakery",icon:"🥐", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},

  /* ── MEAT & FISH ──────────────────────────────────────────────── */
  {id:48, name:"Chicken Breast (500g)",        cat:"🥩 Meat & Fish",   icon:"🍗", prices:sp(3.80,[0,0.15,1,0.7,0.07])},
  {id:49, name:"Chicken Thighs (1kg)",         cat:"🥩 Meat & Fish",   icon:"🍗", prices:sp(3.20,[0,0.2,0.9,0.65,0.1])},
  {id:50, name:"Chicken Drumsticks (1kg)",     cat:"🥩 Meat & Fish",   icon:"🍗", prices:sp(2.80,[0,1.18,0.8,0.58,0.09])},
  {id:51, name:"Whole Chicken (~1.4kg)",       cat:"🥩 Meat & Fish",   icon:"🍗", prices:sp(5.50,[0,0.4,1.8,1.3,0.2])},
  {id:52, name:"Minced Beef (500g)",           cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.50,[0,-0.20,0.9,0.7,0.07])},
  {id:53, name:"Minced Beef (750g)",           cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(5.00,[0,0.2,1.3,1,0.1])},
  {id:54, name:"Beef Steak (200g)",            cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(5.50,[0,0.4,1.8,1.3,0.2])},
  {id:55, name:"Beef Burgers (4pk)",           cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.20,[0,0.22,0.98,0.72,0.11])},
  {id:56, name:"Pork Chops (2pk)",             cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.20,[0,0.2,0.9,0.7,0.1])},
  {id:57, name:"Pork Mince (500g)",            cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.00,[0,0.18,0.85,0.65,0.09])},
  {id:58, name:"Pork Ribs (500g)",             cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(3.80,[0,0.25,1,0.78,0.12])},
  {id:59, name:"Lamb Mince (500g)",            cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(4.50,[0,0.3,1.2,0.95,0.15])},
  {id:60, name:"Lamb Chops (2pk)",             cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(4.80,[0,0.35,1.3,1,0.17])},
  {id:61, name:"Back Bacon (200g)",            cat:"🥩 Meat & Fish",   icon:"🥓", prices:sp(2.50,[0,-1.01,0.7,0.5,0.07])},
  {id:62, name:"Streaky Bacon (200g)",         cat:"🥩 Meat & Fish",   icon:"🥓", prices:sp(2.30,[0,0.14,0.65,0.47,0.07])},
  {id:63, name:"Sausages Pork (8pk)",          cat:"🥩 Meat & Fish",   icon:"🌭", prices:sp(2.80,[0.10,0.2,0.8,0.6,0.1])},
  {id:64, name:"Chipolatas (12pk)",            cat:"🥩 Meat & Fish",   icon:"🌭", prices:sp(2.60,[0,0.18,0.76,0.57,0.09])},
  {id:65, name:"Chorizo (200g)",               cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(2.80,[0,0.22,0.88,0.68,0.11])},
  {id:66, name:"Salami (100g)",                cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(2.20,[0,0.18,0.75,0.57,0.09])},
  {id:67, name:"Ham Slices (120g)",            cat:"🥩 Meat & Fish",   icon:"🥩", prices:sp(1.80,[1.00,0.15,0.65,0.5,0.07])},
  {id:68, name:"Turkey Mince (500g)",          cat:"🥩 Meat & Fish",   icon:"🦃", prices:sp(3.40,[0,0.35,0.95,0.72,0.11])},
  {id:69, name:"Salmon Fillets (2pk)",         cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(4.20,[0,-0.14,1.3,1,0.12])},
  {id:70, name:"Smoked Salmon (100g)",         cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(3.20,[1.60,0.3,1.2,0.95,0.15])},
  {id:71, name:"Cod Fillets (2pk)",            cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(3.80,[0,0.25,1.2,0.9,0.12])},
  {id:72, name:"Haddock Fillets (2pk)",        cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(3.60,[0,0.24,1.15,0.88,0.12])},
  {id:73, name:"Tuna Steaks (2pk)",            cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(4.60,[0,0.3,1.4,1.1,0.15])},
  {id:74, name:"Prawns (200g)",                cat:"🥩 Meat & Fish",   icon:"🍤", prices:sp(3.60,[0,0.25,1.1,0.85,0.12])},
  {id:75, name:"Tuna Canned in Brine (145g)",  cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(0.95,[0,0.08,0.4,0.3,0.04])},
  {id:76, name:"Tuna Canned 4pk",              cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(3.50,[0,0.28,1.2,1,0.14])},
  {id:77, name:"Sardines Canned (120g)",       cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(0.85,[0,0.08,0.35,0.26,0.04])},
  {id:78, name:"Mackerel Fillets (125g)",      cat:"🥩 Meat & Fish",   icon:"🐟", prices:sp(1.20,[0,0.1,0.45,0.35,0.05])},
  {id:79, name:"Crab Sticks (200g)",           cat:"🥩 Meat & Fish",   icon:"🦀", prices:sp(1.80,[0,0.15,0.65,0.5,0.07])},

  /* ── FRUIT & VEG ──────────────────────────────────────────────── */
  {id:80, name:"Bananas (5pk)",                cat:"🥦 Fruit & Veg",  icon:"🍌", prices:sp(0.90,[0,0.05,0.3,0.2,0.03])},
  {id:81, name:"Apples Braeburn (6pk)",        cat:"🥦 Fruit & Veg",  icon:"🍎", prices:sp(1.40,[2.20,0.15,0.55,0.4,0.07])},
  {id:82, name:"Apples Granny Smith (6pk)",    cat:"🥦 Fruit & Veg",  icon:"🍏", prices:sp(1.40,[0,0.15,0.55,0.4,0.07])},
  {id:83, name:"Oranges (4pk)",                cat:"🥦 Fruit & Veg",  icon:"🍊", prices:sp(1.50,[0,0.15,0.6,0.45,0.07])},
  {id:84, name:"Satsumas (700g bag)",          cat:"🥦 Fruit & Veg",  icon:"🍊", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:85, name:"Lemons (4pk)",                 cat:"🥦 Fruit & Veg",  icon:"🍋", prices:sp(0.90,[0,0.1,0.38,0.28,0.05])},
  {id:86, name:"Limes (4pk)",                  cat:"🥦 Fruit & Veg",  icon:"🍋", prices:sp(0.90,[0,0.1,0.38,0.28,0.05])},
  {id:87, name:"Strawberries (400g)",          cat:"🥦 Fruit & Veg",  icon:"🍓", prices:sp(2.50,[0,0.2,0.9,0.7,0.1])},
  {id:88, name:"Raspberries (150g)",           cat:"🥦 Fruit & Veg",  icon:"🍓", prices:sp(2.20,[0,0.2,0.85,0.65,0.1])},
  {id:89, name:"Blueberries (150g)",           cat:"🥦 Fruit & Veg",  icon:"🫐", prices:sp(2.20,[0,0.2,0.85,0.65,0.1])},
  {id:90, name:"Grapes White (500g)",          cat:"🥦 Fruit & Veg",  icon:"🍇", prices:sp(2.20,[0,0.2,0.8,0.65,0.1])},
  {id:91, name:"Grapes Red (500g)",            cat:"🥦 Fruit & Veg",  icon:"🍇", prices:sp(2.20,[0,0.2,0.8,0.65,0.1])},
  {id:92, name:"Avocados (2pk)",               cat:"🥦 Fruit & Veg",  icon:"🥑", prices:sp(1.80,[0,0.2,0.8,0.6,0.1])},
  {id:93, name:"Melon Cantaloupe (half)",      cat:"🥦 Fruit & Veg",  icon:"🍈", prices:sp(1.40,[0,0.15,0.55,0.42,0.07])},
  {id:94, name:"Mango (each)",                 cat:"🥦 Fruit & Veg",  icon:"🥭", prices:sp(0.85,[0,0.1,0.38,0.28,0.05])},
  {id:95, name:"Pineapple (each)",             cat:"🥦 Fruit & Veg",  icon:"🍍", prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:96, name:"Kiwi Fruit (4pk)",             cat:"🥦 Fruit & Veg",  icon:"🥝", prices:sp(0.95,[0,0.1,0.4,0.3,0.05])},
  {id:97, name:"Broccoli (head)",              cat:"🥦 Fruit & Veg",  icon:"🥦", prices:sp(0.85,[0,0.05,0.3,0.2,0.03])},
  {id:98, name:"Cauliflower (head)",           cat:"🥦 Fruit & Veg",  icon:"🥦", prices:sp(0.95,[0,0.08,0.35,0.26,0.04])},
  {id:99, name:"Bag of Spinach (200g)",        cat:"🥦 Fruit & Veg",  icon:"🥬", prices:sp(1.25,[0,0.1,0.5,0.35,0.05])},
  {id:100,name:"Kale (200g)",                  cat:"🥦 Fruit & Veg",  icon:"🥬", prices:sp(1.30,[0,0.12,0.5,0.38,0.06])},
  {id:101,name:"Mixed Salad Leaves (100g)",    cat:"🥦 Fruit & Veg",  icon:"🥗", prices:sp(1.10,[0,0.1,0.42,0.32,0.05])},
  {id:102,name:"Rocket (100g)",               cat:"🥦 Fruit & Veg",  icon:"🥗", prices:sp(1.20,[0,0.12,0.48,0.36,0.06])},
  {id:103,name:"Mixed Peppers (3pk)",          cat:"🥦 Fruit & Veg",  icon:"🫑", prices:sp(1.60,[0,0.15,0.6,0.4,0.07])},
  {id:104,name:"Red Pepper (each)",            cat:"🥦 Fruit & Veg",  icon:"🫑", prices:sp(0.65,[0,0.07,0.28,0.2,0.04])},
  {id:105,name:"Carrots (1kg)",                cat:"🥦 Fruit & Veg",  icon:"🥕", prices:sp(0.70,[0,0.08,0.3,0.22,0.04])},
  {id:106,name:"Parsnips (500g)",              cat:"🥦 Fruit & Veg",  icon:"🥕", prices:sp(0.90,[0,0.09,0.35,0.26,0.04])},
  {id:107,name:"Onions (1kg)",                 cat:"🥦 Fruit & Veg",  icon:"🧅", prices:sp(0.80,[0,0.1,0.35,0.25,0.05])},
  {id:108,name:"Spring Onions (bunch)",        cat:"🥦 Fruit & Veg",  icon:"🧅", prices:sp(0.60,[0,0.07,0.28,0.2,0.04])},
  {id:109,name:"Red Onions (3pk)",             cat:"🥦 Fruit & Veg",  icon:"🧅", prices:sp(0.90,[0,0.09,0.35,0.26,0.04])},
  {id:110,name:"Garlic (3 bulbs)",             cat:"🥦 Fruit & Veg",  icon:"🧄", prices:sp(0.75,[0,0.1,0.35,0.25,0.05])},
  {id:111,name:"Cherry Tomatoes (250g)",       cat:"🥦 Fruit & Veg",  icon:"🍅", prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:112,name:"Vine Tomatoes (500g)",         cat:"🥦 Fruit & Veg",  icon:"🍅", prices:sp(1.30,[0,0.12,0.5,0.38,0.06])},
  {id:113,name:"Cucumber (each)",              cat:"🥦 Fruit & Veg",  icon:"🥒", prices:sp(0.65,[0,0.08,0.3,0.22,0.04])},
  {id:114,name:"Courgette (2pk)",              cat:"🥦 Fruit & Veg",  icon:"🥒", prices:sp(0.90,[0,0.1,0.4,0.3,0.05])},
  {id:115,name:"Aubergine (each)",             cat:"🥦 Fruit & Veg",  icon:"🍆", prices:sp(0.80,[0,0.08,0.32,0.24,0.04])},
  {id:116,name:"Butternut Squash (each)",      cat:"🥦 Fruit & Veg",  icon:"🎃", prices:sp(1.00,[0,0.1,0.4,0.3,0.05])},
  {id:117,name:"Sweet Potatoes (750g)",        cat:"🥦 Fruit & Veg",  icon:"🍠", prices:sp(1.30,[0,0.15,0.55,0.4,0.07])},
  {id:118,name:"Mushrooms (250g)",             cat:"🥦 Fruit & Veg",  icon:"🍄", prices:sp(1.10,[0,0.1,0.45,0.35,0.05])},
  {id:119,name:"Celery (head)",                cat:"🥦 Fruit & Veg",  icon:"🥬", prices:sp(0.90,[0,0.1,0.38,0.28,0.05])},
  {id:120,name:"Lettuce Iceberg (each)",       cat:"🥦 Fruit & Veg",  icon:"🥗", prices:sp(0.75,[0,0.08,0.3,0.22,0.04])},
  {id:121,name:"Asparagus (200g)",             cat:"🥦 Fruit & Veg",  icon:"🥦", prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:122,name:"Sweetcorn (2pk)",              cat:"🥦 Fruit & Veg",  icon:"🌽", prices:sp(0.90,[0,0.09,0.36,0.26,0.04])},
  {id:123,name:"Leek (each)",                  cat:"🥦 Fruit & Veg",  icon:"🥬", prices:sp(0.55,[0,0.06,0.24,0.18,0.03])},
  {id:124,name:"White Potatoes (2.5kg)",       cat:"🥦 Fruit & Veg",  icon:"🥔", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:125,name:"Baby New Potatoes (500g)",     cat:"🥦 Fruit & Veg",  icon:"🥔", prices:sp(1.10,[0,0.1,0.42,0.32,0.05])},
  {id:126,name:"Chilli (3pk)",                 cat:"🥦 Fruit & Veg",  icon:"🌶️", prices:sp(0.65,[0,0.07,0.28,0.2,0.04])},
  {id:127,name:"Ginger Root (piece)",          cat:"🥦 Fruit & Veg",  icon:"🫚", prices:sp(0.45,[0,0.05,0.2,0.15,0.03])},

  /* ── FROZEN ───────────────────────────────────────────────────── */
  {id:128,name:"Frozen Peas (900g)",           cat:"🧊 Frozen",       icon:"🟢", prices:sp(1.80,[1.60,0.18,0.7,0.55,0.09])},
  {id:129,name:"Frozen Peas & Sweetcorn (1kg)",cat:"🧊 Frozen",       icon:"🟢", prices:sp(1.60,[0,0.16,0.65,0.5,0.08])},
  {id:130,name:"Frozen Chips Straight (1.5kg)",cat:"🧊 Frozen",       icon:"🍟", prices:sp(2.20,[-0.10,0.2,0.8,0.6,0.1])},
  {id:131,name:"Frozen Chips Crinkle (1kg)",   cat:"🧊 Frozen",       icon:"🍟", prices:sp(1.90,[0,0.18,0.72,0.55,0.09])},
  {id:132,name:"Frozen Oven Pizza (Margherita)",cat:"🧊 Frozen",      icon:"🍕", prices:sp(2.50,[1.95,0.50,0.95,0.75,0.12])},
  {id:133,name:"Frozen Oven Pizza (Pepperoni)", cat:"🧊 Frozen",      icon:"🍕", prices:sp(2.80,[1.65,0.70,1,0.8,0.14])},
  {id:134,name:"Ice Cream Vanilla (1L)",       cat:"🧊 Frozen",       icon:"🍨", prices:sp(3.00,[0.15,0.3,1.1,0.85,0.15])},
  {id:135,name:"Ice Cream Tub Luxury (500ml)", cat:"🧊 Frozen",       icon:"🍨", prices:sp(3.80,[0.15,0.38,1.35,1.05,0.19])},
  {id:136,name:"Frozen Fish Fingers (12pk)",   cat:"🧊 Frozen",       icon:"🐟", prices:sp(2.80,[1.95,0.25,1,0.8,0.12])},
  {id:137,name:"Frozen Salmon Fillets (4pk)",  cat:"🧊 Frozen",       icon:"🐟", prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:138,name:"Frozen Cod Fillets (4pk)",     cat:"🧊 Frozen",       icon:"🐟", prices:sp(4.80,[0,0.44,1.6,1.22,0.22])},
  {id:139,name:"Frozen Prawns (400g)",         cat:"🧊 Frozen",       icon:"🍤", prices:sp(4.50,[0,0.4,1.4,1.1,0.2])},
  {id:140,name:"Frozen Berries Mixed (500g)",  cat:"🧊 Frozen",       icon:"🍓", prices:sp(2.40,[0,0.22,0.85,0.65,0.11])},
  {id:141,name:"Frozen Edamame (500g)",        cat:"🧊 Frozen",       icon:"🫘", prices:sp(2.20,[0,0.22,0.8,0.6,0.11])},
  {id:142,name:"Frozen Hash Browns (700g)",    cat:"🧊 Frozen",       icon:"🥔", prices:sp(2.00,[0,0.2,0.78,0.6,0.1])},
  {id:143,name:"Frozen Mince Beef (900g)",     cat:"🧊 Frozen",       icon:"🥩", prices:sp(5.80,[0,0.5,1.8,1.4,0.25])},
  {id:144,name:"Frozen Garlic Bread (2pk)",    cat:"🧊 Frozen",       icon:"🍞", prices:sp(1.50,[-0.20,0.15,0.6,0.46,0.07])},
  {id:145,name:"Frozen Waffles (8pk)",         cat:"🧊 Frozen",       icon:"🧇", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:146,name:"Frozen Vegetarian Burgers 4pk",cat:"🧊 Frozen",       icon:"🍔", prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:147,name:"Frozen Yorkshire Puddings 9pk",cat:"🧊 Frozen",       icon:"🍳", prices:sp(1.50,[0,0.15,0.58,0.44,0.07])},

  /* ── DRINKS ───────────────────────────────────────────────────── */
  {id:148,name:"Orange Juice (1L)",            cat:"🥤 Drinks",       icon:"🍊", prices:sp(1.65,[0,0.1,0.5,0.35,0.05])},
  {id:149,name:"Apple Juice (1L)",             cat:"🥤 Drinks",       icon:"🍏", prices:sp(1.55,[0,0.1,0.5,0.35,0.05])},
  {id:150,name:"Cranberry Juice (1L)",         cat:"🥤 Drinks",       icon:"🍷", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:151,name:"Pineapple Juice (1L)",         cat:"🥤 Drinks",       icon:"🍍", prices:sp(1.65,[0,0.16,0.65,0.5,0.08])},
  {id:152,name:"Still Water (1.5L)",           cat:"🥤 Drinks",       icon:"💧", prices:sp(0.55,[0,0.08,0.3,0.22,0.04])},
  {id:153,name:"Sparkling Water (1.5L)",       cat:"🥤 Drinks",       icon:"💧", prices:sp(0.65,[0,0.08,0.3,0.22,0.04])},
  {id:154,name:"Coca-Cola (1.75L)",            cat:"🥤 Drinks",       icon:"🥤", prices:sp(2.20,[0,0.2,0.8,0.6,0.1])},
  {id:155,name:"Pepsi Max (1.75L)",            cat:"🥤 Drinks",       icon:"🥤", prices:sp(2.10,[0,0.2,0.78,0.44,0.1])},
  {id:156,name:"Lemonade (2L)",                cat:"🥤 Drinks",       icon:"🥤", prices:sp(0.95,[0,0.1,0.38,0.28,0.05])},
  {id:157,name:"Fanta Orange (1.5L)",          cat:"🥤 Drinks",       icon:"🥤", prices:sp(1.65,[0,0.16,0.65,0.5,0.08])},
  {id:158,name:"Sprite (1.5L)",                cat:"🥤 Drinks",       icon:"🥤", prices:sp(1.65,[0,0.16,0.65,0.5,0.08])},
  {id:159,name:"Lucozade Sport (500ml)",       cat:"🥤 Drinks",       icon:"🥤", prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:160,name:"Energy Drink 250ml (4pk)",     cat:"🥤 Drinks",       icon:"⚡", prices:sp(3.20,[0,0.3,1.15,0.88,0.15])},
  {id:161,name:"Filter Coffee (227g)",         cat:"🥤 Drinks",       icon:"☕", prices:sp(3.20,[0,0.2,1,0.75,0.1])},
  {id:162,name:"Instant Coffee (100g)",        cat:"🥤 Drinks",       icon:"☕", prices:sp(3.50,[0,0.3,1.2,0.95,0.15])},
  {id:163,name:"Coffee Pods (16pk)",           cat:"🥤 Drinks",       icon:"☕", prices:sp(4.50,[0,0.4,1.45,1.12,0.2])},
  {id:164,name:"Tea Bags (80pk)",              cat:"🥤 Drinks",       icon:"🫖", prices:sp(2.50,[0,0.2,0.85,0.65,0.1])},
  {id:165,name:"Tea Bags (160pk)",             cat:"🥤 Drinks",       icon:"🫖", prices:sp(4.50,[0,0.38,1.45,1.12,0.19])},
  {id:166,name:"Green Tea Bags (40pk)",        cat:"🥤 Drinks",       icon:"🍵", prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:167,name:"Herbal Tea Variety (20pk)",    cat:"🥤 Drinks",       icon:"🍵", prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:168,name:"Hot Chocolate Powder (400g)",  cat:"🥤 Drinks",       icon:"☕", prices:sp(3.50,[0,0.3,1.2,0.95,0.15])},
  {id:169,name:"Red Wine Bottle (75cl)",       cat:"🥤 Drinks",       icon:"🍷", prices:sp(6.50,[0.75,0.5,2,1.6,0.25])},
  {id:170,name:"White Wine Bottle (75cl)",     cat:"🥤 Drinks",       icon:"🍾", prices:sp(6.00,[0.5,0.5,2,1.6,0.25])},
  {id:171,name:"Rosé Wine Bottle (75cl)",      cat:"🥤 Drinks",       icon:"🌸", prices:sp(6.20,[1.05,0.52,2.05,1.62,0.26])},
  {id:172,name:"Prosecco (75cl)",              cat:"🥤 Drinks",       icon:"🥂", prices:sp(8.00,[-1.5,0.7,2.5,2,0.35])},
  {id:173,name:"Beer Lager 4pk (440ml)",       cat:"🥤 Drinks",       icon:"🍺", prices:sp(4.20,[0,-0.20,1.5,1.2,0.2])},
  {id:174,name:"Craft Beer 4pk (330ml)",       cat:"🥤 Drinks",       icon:"🍺", prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:175,name:"Gin (70cl)",                   cat:"🥤 Drinks",       icon:"🍸", prices:sp(18.0,[0,1.5,5,4,0.75])},
  {id:176,name:"Vodka (70cl)",                 cat:"🥤 Drinks",       icon:"🍸", prices:sp(15.0,[0,1.10,4.5,3.5,0.6])},
  {id:177,name:"Whisky (70cl)",                cat:"🥤 Drinks",       icon:"🥃", prices:sp(20.0,[0,1.8,6,4.8,0.9])},
  {id:178,name:"Rum (70cl)",                   cat:"🥤 Drinks",       icon:"🍸", prices:sp(14.0,[0,1.1,4.2,3.3,0.55])},
  {id:179,name:"Squash (1L)",                  cat:"🥤 Drinks",       icon:"🥤", prices:sp(1.50,[0.6,0.15,0.6,0.46,0.07])},

  /* ── PANTRY ───────────────────────────────────────────────────── */
  {id:180,name:"Pasta Penne (500g)",           cat:"🍝 Pantry",       icon:"🍝", prices:sp(0.89,[0.06,0.06,0.41,0.26,0.03])},
  {id:181,name:"Spaghetti (500g)",             cat:"🍝 Pantry",       icon:"🍝", prices:sp(0.89,[0.06,0.06,0.41,0.26,0.03])},
  {id:182,name:"Fusilli (500g)",               cat:"🍝 Pantry",       icon:"🍝", prices:sp(0.89,[0.06,0.06,0.41,0.26,0.03])},
  {id:183,name:"Tagliatelle (500g)",           cat:"🍝 Pantry",       icon:"🍝", prices:sp(0.95,[0.0,0.08,0.42,0.28,0.04])},
  {id:184,name:"Tinned Tomatoes (400g)",       cat:"🍝 Pantry",       icon:"🍅", prices:sp(0.65,[0.0,-0.18,0.34,0.25,0.03])},
  {id:185,name:"Tinned Tomatoes (4pk)",        cat:"🍝 Pantry",       icon:"🍅", prices:sp(2.40,[0,0.18,1.2,0.95,0.09])},
  {id:186,name:"Passata (680g)",               cat:"🍝 Pantry",       icon:"🍅", prices:sp(0.90,[0,0.09,0.36,0.28,0.04])},
  {id:187,name:"Tinned Chickpeas (400g)",      cat:"🍝 Pantry",       icon:"🫘", prices:sp(0.75,[0,0.08,0.38,0.28,0.04])},
  {id:188,name:"Tinned Kidney Beans (400g)",   cat:"🍝 Pantry",       icon:"🫘", prices:sp(0.70,[0,0.07,0.36,0.26,0.04])},
  {id:189,name:"Tinned Lentils (400g)",        cat:"🍝 Pantry",       icon:"🫘", prices:sp(0.80,[0,0.08,0.38,0.28,0.04])},
  {id:190,name:"Tinned Baked Beans (415g)",    cat:"🍝 Pantry",       icon:"🫘", prices:sp(0.70,[0,0.06,0.25,0.15,0.03])},
  {id:191,name:"Tinned Sweetcorn (340g)",      cat:"🍝 Pantry",       icon:"🌽", prices:sp(0.65,[0,0.08,0.32,0.24,0.04])},
  {id:192,name:"Tinned Coconut Milk (400ml)",  cat:"🍝 Pantry",       icon:"🥥", prices:sp(1.10,[0,0.1,0.45,0.34,0.05])},
  {id:193,name:"Olive Oil Extra Virgin (500ml)",cat:"🍝 Pantry",      icon:"🫒", prices:sp(3.80,[0,0.19,1.2,0.95,0.1])},
  {id:194,name:"Sunflower Oil (1L)",           cat:"🍝 Pantry",       icon:"🌻", prices:sp(2.20,[0.35,0.18,0.9,0.7,0.09])},
  {id:195,name:"Vegetable Oil (1L)",           cat:"🍝 Pantry",       icon:"🌻", prices:sp(1.90,[2.49,0.16,0.78,0.6,0.08])},
  {id:196,name:"Basmati Rice (1kg)",           cat:"🍝 Pantry",       icon:"🍚", prices:sp(1.80,[0.0,0.15,0.7,0.5,0.07])},
  {id:197,name:"Long Grain Rice (1kg)",        cat:"🍝 Pantry",       icon:"🍚", prices:sp(1.60,[0,0.14,0.65,0.48,0.07])},
  {id:198,name:"Microwave Rice (3pk)",         cat:"🍝 Pantry",       icon:"🍚", prices:sp(2.40,[0,0.22,0.88,0.68,0.11])},
  {id:199,name:"Porridge Oats (500g)",         cat:"🍝 Pantry",       icon:"🌾", prices:sp(1.30,[-0.5,0.12,0.5,0.38,0.06])},
  {id:200,name:"Porridge Oats (1kg)",          cat:"🍝 Pantry",       icon:"🌾", prices:sp(2.20,[0,0.2,0.85,0.65,0.1])},
  {id:201,name:"Cornflakes (500g)",            cat:"🍝 Pantry",       icon:"🌽", prices:sp(1.60,[0,0.15,0.6,0.45,0.07])},
  {id:202,name:"Weetabix (24pk)",              cat:"🍝 Pantry",       icon:"🌾", prices:sp(2.80,[0,0.25,0.98,0.76,0.12])},
  {id:203,name:"Muesli (500g)",                cat:"🍝 Pantry",       icon:"🌾", prices:sp(2.50,[0,0.22,0.88,0.68,0.11])},
  {id:204,name:"Granola (500g)",               cat:"🍝 Pantry",       icon:"🌾", prices:sp(2.80,[0,0.25,0.98,0.76,0.12])},
  {id:205,name:"Plain Flour (1.5kg)",          cat:"🍝 Pantry",       icon:"🌾", prices:sp(1.20,[-0.15,0.12,0.5,0.38,0.06])},
  {id:206,name:"Self Raising Flour (1.5kg)",   cat:"🍝 Pantry",       icon:"🌾", prices:sp(1.25,[-0.2,0.12,0.5,0.38,0.06])},
  {id:207,name:"Sugar White (1kg)",            cat:"🍝 Pantry",       icon:"🍬", prices:sp(1.00,[0.35,0.1,0.38,0.28,0.05])},
  {id:208,name:"Caster Sugar (1kg)",           cat:"🍝 Pantry",       icon:"🍬", prices:sp(1.10,[1.25,0.1,0.4,0.3,0.05])},
  {id:209,name:"Icing Sugar (500g)",           cat:"🍝 Pantry",       icon:"🍬", prices:sp(0.90,[0.0,0.09,0.35,0.26,0.04])},
  {id:210,name:"Tomato Ketchup (460g)",        cat:"🍝 Pantry",       icon:"🍅", prices:sp(1.80,[0,0.18,0.7,0.55,0.09])},
  {id:211,name:"Mayonnaise (400g)",            cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.90,[0,0.18,0.75,0.58,0.09])},
  {id:212,name:"Brown Sauce (400ml)",          cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.60,[0.4,0.16,0.65,0.5,0.08])},
  {id:213,name:"English Mustard (185g)",       cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.40,[0,0.14,0.58,0.44,0.07])},
  {id:214,name:"Dijon Mustard (200g)",         cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.60,[0,0.16,0.65,0.5,0.08])},
  {id:215,name:"Soy Sauce (150ml)",            cat:"🍝 Pantry",       icon:"🍶", prices:sp(1.30,[0,0.14,0.5,0.38,0.07])},
  {id:216,name:"Worcestershire Sauce (150ml)", cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:217,name:"Vinegar Malt (568ml)",         cat:"🍝 Pantry",       icon:"🥄", prices:sp(0.95,[0,0.09,0.38,0.28,0.04])},
  {id:218,name:"Balsamic Vinegar (250ml)",     cat:"🍝 Pantry",       icon:"🥄", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:219,name:"Stock Cubes Beef (12pk)",      cat:"🍝 Pantry",       icon:"🫙", prices:sp(1.20,[1.8,0.12,0.48,0.36,0.06])},
  {id:220,name:"Stock Cubes Chicken (12pk)",   cat:"🍝 Pantry",       icon:"🫙", prices:sp(1.20,[0,0.12,0.48,0.36,0.06])},
  {id:221,name:"Stock Cubes Veg (12pk)",       cat:"🍝 Pantry",       icon:"🫙", prices:sp(1.10,[0,0.11,0.44,0.33,0.06])},
  {id:222,name:"Honey (340g)",                 cat:"🍝 Pantry",       icon:"🍯", prices:sp(2.80,[0.09,0.25,1,0.8,0.12])},
  {id:223,name:"Peanut Butter Smooth (340g)",  cat:"🍝 Pantry",       icon:"🥜", prices:sp(2.50,[0,0.22,0.88,0.68,0.11])},
  {id:224,name:"Peanut Butter Crunchy (340g)", cat:"🍝 Pantry",       icon:"🥜", prices:sp(2.50,[-0.4,0.22,0.88,0.68,0.11])},
  {id:225,name:"Strawberry Jam (454g)",        cat:"🍝 Pantry",       icon:"🍓", prices:sp(1.80,[-0.21,0.18,0.7,0.55,0.09])},
  {id:226,name:"Marmalade (454g)",             cat:"🍝 Pantry",       icon:"🍊", prices:sp(1.80,[-0.61,0.18,0.7,0.55,0.09])},
  {id:227,name:"Nutella (400g)",               cat:"🍝 Pantry",       icon:"🍫", prices:sp(3.20,[0,0.28,1.1,0.85,0.14])},
  {id:228,name:"Pasta Sauce Tomato (500g)",    cat:"🍝 Pantry",       icon:"🍅", prices:sp(1.50,[0,0.15,0.6,0.45,0.07])},
  {id:229,name:"Pasta Sauce Bolognese (500g)", cat:"🍝 Pantry",       icon:"🍅", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:230,name:"Curry Paste Medium (283g)",    cat:"🍝 Pantry",       icon:"🍛", prices:sp(2.20,[0,0.2,0.8,0.6,0.1])},
  {id:231,name:"Coconut Cream (200ml)",        cat:"🍝 Pantry",       icon:"🥥", prices:sp(0.90,[0,0.09,0.36,0.27,0.04])},
  {id:232,name:"Noodles Instant (4pk)",        cat:"🍝 Pantry",       icon:"🍜", prices:sp(0.90,[0,0.09,0.36,0.27,0.04])},
  {id:233,name:"Baking Powder (150g)",         cat:"🍝 Pantry",       icon:"🌾", prices:sp(0.85,[0,0.08,0.32,0.24,0.04])},
  {id:234,name:"Bicarbonate of Soda (200g)",   cat:"🍝 Pantry",       icon:"🌾", prices:sp(0.80,[0,0.08,0.3,0.22,0.04])},
  {id:235,name:"Vanilla Extract (60ml)",       cat:"🍝 Pantry",       icon:"🫙", prices:sp(2.20,[0,0.22,0.88,0.68,0.11])},
  {id:236,name:"Cocoa Powder (250g)",          cat:"🍝 Pantry",       icon:"🍫", prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:237,name:"Cornflour (250g)",             cat:"🍝 Pantry",       icon:"🌾", prices:sp(0.80,[0.65,0.08,0.3,0.22,0.04])},
  {id:238,name:"Dried Pasta Mixed 3kg",        cat:"🍝 Pantry",       icon:"🍝", prices:sp(4.50,[0,0.38,1.45,1.12,0.19])},

  /* ── SNACKS & TREATS ──────────────────────────────────────────── */
  {id:239,name:"Crisps Multipack (6pk)",       cat:"🥨 Snacks & Treats",icon:"🥨",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:240,name:"Crisps Large Sharing Bag",     cat:"🥨 Snacks & Treats",icon:"🥨",prices:sp(2.20,[-0.9,0.22,0.85,0.65,0.11])},
  {id:241,name:"Tortilla Chips (200g)",        cat:"🥨 Snacks & Treats",icon:"🌮",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:242,name:"Salsa Dip (300g)",             cat:"🥨 Snacks & Treats",icon:"🌮",prices:sp(1.60,[0,0.16,0.64,0.49,0.08])},
  {id:243,name:"Hummus (200g)",                cat:"🥨 Snacks & Treats",icon:"🥙",prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:244,name:"Digestive Biscuits (400g)",    cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.20,[0,0.12,0.5,0.38,0.06])},
  {id:245,name:"Hobnobs (300g)",               cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:246,name:"Shortbread Fingers (160g)",    cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:247,name:"Rich Tea Biscuits (300g)",     cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.10,[0,0.11,0.44,0.33,0.06])},
  {id:248,name:"Chocolate Digestives (300g)",  cat:"🥨 Snacks & Treats",icon:"🍪",prices:sp(1.60,[0,0.16,0.64,0.49,0.08])},
  {id:249,name:"Chocolate Bar Milk (100g)",    cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(1.50,[0,0.15,0.6,0.45,0.07])},
  {id:250,name:"Chocolate Bar Dark (100g)",    cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(1.60,[0,0.16,0.64,0.49,0.08])},
  {id:251,name:"Chocolate Fingers (114g)",     cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:252,name:"Kit Kat 4pk",                  cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(1.30,[0,0.13,0.52,0.4,0.07])},
  {id:253,name:"Mixed Nuts (200g)",            cat:"🥨 Snacks & Treats",icon:"🥜",prices:sp(2.80,[0,0.25,0.95,0.75,0.12])},
  {id:254,name:"Cashew Nuts (200g)",           cat:"🥨 Snacks & Treats",icon:"🥜",prices:sp(3.20,[0,0.28,1.1,0.85,0.14])},
  {id:255,name:"Cereal Bars 5pk",              cat:"🥨 Snacks & Treats",icon:"🍫",prices:sp(2.20,[0,0.2,0.8,0.6,0.1])},
  {id:256,name:"Rice Cakes Plain (130g)",      cat:"🥨 Snacks & Treats",icon:"🍘",prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:257,name:"Popcorn (100g)",               cat:"🥨 Snacks & Treats",icon:"🍿",prices:sp(1.20,[0,0.12,0.48,0.36,0.06])},
  {id:258,name:"Sweets Pick n Mix (200g)",     cat:"🥨 Snacks & Treats",icon:"🍬",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:259,name:"Jelly Babies (190g)",          cat:"🥨 Snacks & Treats",icon:"🍬",prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:260,name:"Fruit Pastilles (52g roll)",   cat:"🥨 Snacks & Treats",icon:"🍬",prices:sp(0.80,[0,0.08,0.32,0.24,0.04])},
  {id:261,name:"Kettle Chips (150g)",          cat:"🥨 Snacks & Treats",icon:"🥨",prices:sp(1.80,[1.0,0.18,0.7,0.54,0.09])},
  {id:262,name:"Pretzels (175g)",              cat:"🥨 Snacks & Treats",icon:"🥨",prices:sp(1.60,[0,0.16,0.64,0.49,0.08])},

  /* ── HOUSEHOLD ────────────────────────────────────────────────── */
  {id:263,name:"Washing Up Liquid (500ml)",    cat:"🧹 Household",    icon:"🧴", prices:sp(1.20,[0.0,0.15,0.55,0.4,0.07])},
  {id:264,name:"Washing Up Liquid (900ml)",    cat:"🧹 Household",    icon:"🧴", prices:sp(2.00,[0,0.22,0.85,0.65,0.11])},
  {id:265,name:"Laundry Liquid (800ml)",       cat:"🧹 Household",    icon:"🫧", prices:sp(5.50,[-2.75,0.5,1.8,1.4,0.25])},
  {id:266,name:"Laundry Tablets (30pk)",       cat:"🧹 Household",    icon:"🫧", prices:sp(7.50,[0,0.7,2.5,2,0.35])},
  {id:267,name:"Laundry Capsules (32pk)",      cat:"🧹 Household",    icon:"🫧", prices:sp(8.50,[-1.75,0.8,2.8,2.2,0.4])},
  {id:268,name:"Fabric Conditioner (1L)",      cat:"🧹 Household",    icon:"🫧", prices:sp(3.80,[-1.9,0.35,1.3,1,0.17])},
  {id:269,name:"Toilet Rolls (9pk)",           cat:"🧹 Household",    icon:"🧻", prices:sp(4.50,[-0.1,0.4,1.6,1.2,0.2])},
  {id:270,name:"Toilet Rolls (24pk)",          cat:"🧹 Household",    icon:"🧻", prices:sp(10.0,[0,0.88,3.5,2.7,0.44])},
  {id:271,name:"Kitchen Roll (2pk)",           cat:"🧹 Household",    icon:"🧻", prices:sp(1.80,[-0.15,0.18,0.7,0.55,0.09])},
  {id:272,name:"Bin Bags (30pk)",              cat:"🧹 Household",    icon:"🗑️", prices:sp(2.50,[0,0.25,0.9,0.7,0.12])},
  {id:273,name:"Freezer Bags (50pk)",          cat:"🧹 Household",    icon:"📦", prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:274,name:"Cling Film (30m)",             cat:"🧹 Household",    icon:"📦", prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:275,name:"Foil Roll (30m)",              cat:"🧹 Household",    icon:"📦", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:276,name:"Sandwich Bags (50pk)",         cat:"🧹 Household",    icon:"📦", prices:sp(1.20,[0,0.12,0.48,0.36,0.06])},
  {id:277,name:"All-Purpose Spray (500ml)",    cat:"🧹 Household",    icon:"🧹", prices:sp(1.90,[-0.7,0.18,0.72,0.55,0.09])},
  {id:278,name:"Bleach (750ml)",               cat:"🧹 Household",    icon:"🧹", prices:sp(1.10,[0.1,0.11,0.44,0.33,0.06])},
  {id:279,name:"Bathroom Cleaner (500ml)",     cat:"🧹 Household",    icon:"🧹", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:280,name:"Floor Cleaner (1L)",           cat:"🧹 Household",    icon:"🧹", prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:281,name:"Dishwasher Tablets (30pk)",    cat:"🧹 Household",    icon:"🍽️", prices:sp(6.50,[0,0.6,2.2,1.8,0.3])},
  {id:282,name:"Dishwasher Salt (1.5kg)",      cat:"🧹 Household",    icon:"🍽️", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:283,name:"Washing Up Gloves",            cat:"🧹 Household",    icon:"🧤", prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:284,name:"Sponge Scourers (5pk)",        cat:"🧹 Household",    icon:"🧹", prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:285,name:"Light Bulb LED (4pk)",         cat:"🧹 Household",    icon:"💡", prices:sp(4.50,[0,0.4,1.6,1.2,0.2])},
  {id:286,name:"Batteries AA (4pk)",           cat:"🧹 Household",    icon:"🔋", prices:sp(3.50,[1.7,0.32,1.2,0.95,0.16])},
  {id:287,name:"Batteries AAA (4pk)",          cat:"🧹 Household",    icon:"🔋", prices:sp(3.50,[1.7,0.32,1.2,0.95,0.16])},
  {id:288,name:"Candles (4pk)",                cat:"🧹 Household",    icon:"🕯️", prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},

  /* ── HEALTH & BEAUTY ──────────────────────────────────────────── */
  {id:289,name:"Shampoo (400ml)",              cat:"💊 Health & Beauty",icon:"🧴",prices:sp(2.50,[0.15,-1.40,0.95,0.75,0.12])},
  {id:290,name:"Conditioner (400ml)",          cat:"💊 Health & Beauty",icon:"🧴",prices:sp(2.50,[0.05,0.25,0.95,0.75,0.12])},
  {id:291,name:"2-in-1 Shampoo (400ml)",       cat:"💊 Health & Beauty",icon:"🧴",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:292,name:"Shower Gel (500ml)",           cat:"💊 Health & Beauty",icon:"🚿",prices:sp(2.00,[-0.05,1.75,0.8,0.6,0.1])},
  {id:293,name:"Body Wash (500ml)",            cat:"💊 Health & Beauty",icon:"🚿",prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:294,name:"Bar Soap (4pk)",               cat:"💊 Health & Beauty",icon:"🧼",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:295,name:"Hand Soap (250ml)",            cat:"💊 Health & Beauty",icon:"🧼",prices:sp(1.40,[0.29,0.15,0.55,0.42,0.07])},
  {id:296,name:"Hand Sanitiser (250ml)",       cat:"💊 Health & Beauty",icon:"🧼",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:297,name:"Moisturiser Face (50ml)",      cat:"💊 Health & Beauty",icon:"🧴",prices:sp(3.80,[0,0.35,1.3,1,0.17])},
  {id:298,name:"Body Lotion (400ml)",          cat:"💊 Health & Beauty",icon:"🧴",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:299,name:"Toothpaste (75ml)",            cat:"💊 Health & Beauty",icon:"🪥",prices:sp(1.80,[0.09,3.20,0.7,0.55,0.09])},
  {id:300,name:"Toothpaste Electric Compat",   cat:"💊 Health & Beauty",icon:"🪥",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:301,name:"Toothbrush Manual (2pk)",      cat:"💊 Health & Beauty",icon:"🪥",prices:sp(2.20,[-1.25,0.22,0.85,0.65,0.11])},
  {id:302,name:"Dental Floss (50m)",           cat:"💊 Health & Beauty",icon:"🦷",prices:sp(1.50,[0,0.15,0.6,0.46,0.07])},
  {id:303,name:"Mouthwash (500ml)",            cat:"💊 Health & Beauty",icon:"🦷",prices:sp(2.50,[0.65,0.83,0.95,0.75,0.12])},
  {id:304,name:"Deodorant Spray (150ml)",      cat:"💊 Health & Beauty",icon:"💨",prices:sp(2.20,[0,0.22,0.88,0.68,0.11])},
  {id:305,name:"Deodorant Roll-On (50ml)",     cat:"💊 Health & Beauty",icon:"💨",prices:sp(2.00,[0,0.2,0.8,0.6,0.1])},
  {id:306,name:"Razor Cartridges (4pk)",       cat:"💊 Health & Beauty",icon:"🪒",prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:307,name:"Shaving Foam (200ml)",         cat:"💊 Health & Beauty",icon:"🪒",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:308,name:"Sun Cream SPF50 (200ml)",      cat:"💊 Health & Beauty",icon:"☀️",prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:309,name:"Paracetamol (16pk)",           cat:"💊 Health & Beauty",icon:"💊",prices:sp(0.65,[0,0.08,0.3,0.22,0.04])},
  {id:310,name:"Ibuprofen (16pk)",             cat:"💊 Health & Beauty",icon:"💊",prices:sp(1.10,[-0.63,0.12,0.45,0.34,0.06])},
  {id:311,name:"Cold & Flu Tablets (16pk)",    cat:"💊 Health & Beauty",icon:"💊",prices:sp(3.50,[0,0.32,1.2,0.95,0.16])},
  {id:312,name:"Vitamin C (60pk)",             cat:"💊 Health & Beauty",icon:"💊",prices:sp(4.50,[2.25,0.4,1.6,1.2,0.2])},
  {id:313,name:"Vitamin D (90pk)",             cat:"💊 Health & Beauty",icon:"💊",prices:sp(5.00,[0,0.45,1.7,1.32,0.23])},
  {id:314,name:"Plasters Assorted (40pk)",     cat:"💊 Health & Beauty",icon:"🩹",prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:315,name:"Cotton Wool Pads (100pk)",     cat:"💊 Health & Beauty",icon:"🤍",prices:sp(1.40,[0,0.14,0.56,0.43,0.07])},
  {id:316,name:"Lip Balm",                     cat:"💊 Health & Beauty",icon:"💄",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:317,name:"Feminine Pads (12pk)",         cat:"💊 Health & Beauty",icon:"🩸",prices:sp(2.80,[-0.41,0.28,1,0.8,0.14])},
  {id:318,name:"Tampons (16pk)",               cat:"💊 Health & Beauty",icon:"🩸",prices:sp(2.80,[1.15,0.28,1,0.8,0.14])},
  {id:319,name:"Condoms (12pk)",               cat:"💊 Health & Beauty",icon:"🩺",prices:sp(6.50,[0,0.6,2.2,1.8,0.3])},

  /* ── BABY & CHILD ─────────────────────────────────────────────── */
  {id:320,name:"Nappies Size 3 (40pk)",        cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(7.50,[-1.2,0.68,2.5,2,0.34])},
  {id:321,name:"Nappies Size 4 (36pk)",        cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(7.80,[-1.5,0.7,2.6,2.1,0.35])},
  {id:322,name:"Nappies Size 5 (34pk)",        cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(8.00,[-1.7,0.72,2.65,2.1,0.36])},
  {id:323,name:"Baby Wipes (72pk)",            cat:"🍼 Baby & Child",  icon:"🧻",prices:sp(1.80,[1.35,0.18,0.7,0.54,0.09])},
  {id:324,name:"Baby Wipes (3pk)",             cat:"🍼 Baby & Child",  icon:"🧻",prices:sp(4.50,[0,0.42,1.6,1.2,0.21])},
  {id:325,name:"Baby Shampoo (300ml)",         cat:"🍼 Baby & Child",  icon:"🧴",prices:sp(3.00,[-1.27,0.28,1.1,0.85,0.14])},
  {id:326,name:"Baby Lotion (400ml)",          cat:"🍼 Baby & Child",  icon:"🧴",prices:sp(3.50,[0,0.32,1.2,0.95,0.16])},
  {id:327,name:"Baby Food Purée (4pk)",        cat:"🍼 Baby & Child",  icon:"🥣",prices:sp(3.20,[0,0.28,1.15,0.88,0.14])},
  {id:328,name:"Baby Rice Cereal (125g)",      cat:"🍼 Baby & Child",  icon:"🥣",prices:sp(2.80,[0,0.25,0.98,0.76,0.12])},
  {id:329,name:"Formula Milk Stage 1 (800g)",  cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(11.0,[0,1,3.5,2.8,0.5])},
  {id:330,name:"Formula Milk Stage 2 (800g)",  cat:"🍼 Baby & Child",  icon:"🍼",prices:sp(10.5,[0,0.95,3.4,2.7,0.47])},
  {id:331,name:"Kids Multivitamins (30pk)",    cat:"🍼 Baby & Child",  icon:"💊",prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:332,name:"Children's Paracetamol Liq.",  cat:"🍼 Baby & Child",  icon:"💊",prices:sp(3.80,[0,0.35,1.3,1,0.17])},

  /* ── PET CARE ─────────────────────────────────────────────────── */
  {id:333,name:"Dog Food Dry (2kg)",           cat:"🐾 Pet Care",      icon:"🐶",prices:sp(8.00,[-4.35,0.72,2.65,2.1,0.36])},
  {id:334,name:"Dog Food Wet Cans (6pk)",      cat:"🐾 Pet Care",      icon:"🐶",prices:sp(4.50,[0,0.42,1.6,1.2,0.21])},
  {id:335,name:"Dog Treats (150g)",            cat:"🐾 Pet Care",      icon:"🦴",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:336,name:"Cat Food Dry (2kg)",           cat:"🐾 Pet Care",      icon:"🐱",prices:sp(7.50,[-3.65,0.68,2.5,2,0.34])},
  {id:337,name:"Cat Food Wet Pouches (12pk)",  cat:"🐾 Pet Care",      icon:"🐱",prices:sp(5.50,[-1.9,0.5,1.8,1.4,0.25])},
  {id:338,name:"Cat Treats (60g)",             cat:"🐾 Pet Care",      icon:"🐱",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},
  {id:339,name:"Cat Litter (10L)",             cat:"🐾 Pet Care",      icon:"🐱",prices:sp(5.50,[0,0.5,1.8,1.4,0.25])},
  {id:340,name:"Pet Shampoo (250ml)",          cat:"🐾 Pet Care",      icon:"🛁",prices:sp(4.50,[0,0.42,1.6,1.2,0.21])},
  {id:341,name:"Flea Treatment Spot On (3pk)", cat:"🐾 Pet Care",      icon:"💊",prices:sp(12.0,[0,1.1,4.2,3.3,0.55])},
  {id:342,name:"Fish Food (100g)",             cat:"🐾 Pet Care",      icon:"🐠",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},

  /* ── FREE FROM ────────────────────────────────────────────────── */
  {id:343,name:"GF White Bread (400g)",        cat:"🌱 Free From",    icon:"🍞",prices:sp(2.90,[0,0.28,1,0.8,0.14])},
  {id:344,name:"GF Pasta (500g)",              cat:"🌱 Free From",    icon:"🍝",prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:345,name:"GF Oats (500g)",               cat:"🌱 Free From",    icon:"🌾",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:346,name:"GF Crackers (150g)",           cat:"🌱 Free From",    icon:"🍘",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:347,name:"Dairy Free Cheese (200g)",     cat:"🌱 Free From",    icon:"🧀",prices:sp(3.50,[0,0.32,1.2,0.95,0.16])},
  {id:348,name:"Vegan Butter (250g)",          cat:"🌱 Free From",    icon:"🧈",prices:sp(2.80,[0,0.28,1,0.8,0.14])},
  {id:349,name:"Soya Yoghurt (400g)",          cat:"🌱 Free From",    icon:"🫙",prices:sp(2.20,[0,0.22,0.85,0.65,0.11])},
  {id:350,name:"Vegan Mince (350g)",           cat:"🌱 Free From",    icon:"🥩",prices:sp(3.50,[0,0.32,1.2,0.95,0.16])},
  {id:351,name:"Vegan Sausages (8pk)",         cat:"🌱 Free From",    icon:"🌭",prices:sp(3.20,[0,0.3,1.15,0.88,0.15])},
  {id:352,name:"Vegan Burgers (2pk)",          cat:"🌱 Free From",    icon:"🍔",prices:sp(3.00,[0,0.28,1.1,0.85,0.14])},
  {id:353,name:"Chickpea Dhal (400g jar)",     cat:"🌱 Free From",    icon:"🫘",prices:sp(2.50,[0,0.25,0.95,0.75,0.12])},
  {id:354,name:"Oat Cream (250ml)",            cat:"🌱 Free From",    icon:"🍦",prices:sp(1.80,[0,0.18,0.7,0.54,0.09])},

  /* ── LOCAL JERSEY ─────────────────────────────────────────────── */
  {id:355,name:"Jersey Royal Potatoes (750g)", cat:"🥔 Local Jersey", icon:"🥔",prices:sp(1.50,[0,0.15,0.49,0.35,0.07])},
  {id:356,name:"Jersey Royals (1.5kg)",        cat:"🥔 Local Jersey", icon:"🥔",prices:sp(2.80,[0,0.25,0.8,0.6,0.12])},
  {id:357,name:"Jersey Royals (5kg)",          cat:"🥔 Local Jersey", icon:"🥔",prices:sp(7.50,[0,0.65,2,1.6,0.33])},
  {id:358,name:"Jersey Dairy Cream (300ml)",   cat:"🥔 Local Jersey", icon:"🍦",prices:sp(1.40,[0,0.15,0.4,0.3,0.07])},
  {id:359,name:"Jersey Dairy Butter (250g)",   cat:"🥔 Local Jersey", icon:"🧈",prices:sp(2.40,[0,0.2,0.6,0.45,0.1])},
  {id:360,name:"Jersey Dairy Milk (2L)",       cat:"🥔 Local Jersey", icon:"🥛",prices:sp(1.95,[0,0.18,0.55,0.4,0.09])},
  {id:361,name:"Jersey Dairy Ice Cream (1L)",  cat:"🥔 Local Jersey", icon:"🍨",prices:sp(4.20,[0,0.38,1.1,0.9,0.19])},
  {id:362,name:"Local Jersey Tomatoes (500g)", cat:"🥔 Local Jersey", icon:"🍅",prices:sp(1.80,[0,0.15,0.6,0.4,0.07])},
  {id:363,name:"Local Cucumber (each)",        cat:"🥔 Local Jersey", icon:"🥒",prices:sp(0.75,[0,0.08,0.28,0.22,0.04])},
  {id:364,name:"Jersey Crab (whole, ~600g)",   cat:"🥔 Local Jersey", icon:"🦀",prices:sp(7.50,[0,0.49,2,1.49,0.24])},
  {id:365,name:"Jersey Lobster (per 500g)",    cat:"🥔 Local Jersey", icon:"🦞",prices:sp(12.0,[0,0.8,2.5,2,0.4])},
  {id:366,name:"Local Mussels (1kg)",          cat:"🥔 Local Jersey", icon:"🦪",prices:sp(4.50,[0,0.38,1.2,0.95,0.19])},
  {id:367,name:"Jersey Black Butter (jar)",    cat:"🥔 Local Jersey", icon:"🍯",prices:sp(3.20,[0,0.3,0.9,0.7,0.15])},
  {id:368,name:"Local Apple Juice (1L)",       cat:"🥔 Local Jersey", icon:"🍏",prices:sp(2.80,[0,0.25,0.8,0.6,0.12])},
  {id:369,name:"Jersey Wonders (6pk)",         cat:"🥔 Local Jersey", icon:"🍩",prices:sp(2.00,[0,0.2,0.6,0.45,0.1])},
  {id:370,name:"Local Honey (250g)",           cat:"🥔 Local Jersey", icon:"🍯",prices:sp(5.50,[0,0.5,1.5,1.2,0.25])},
  {id:371,name:"Jersey Elderflower Cordial",   cat:"🥔 Local Jersey", icon:"🌸",prices:sp(4.80,[0,0.44,1.3,1,0.22])},
  {id:372,name:"Local Free Range Eggs (6pk)",  cat:"🥔 Local Jersey", icon:"🥚",prices:sp(2.20,[0,0.2,0.65,0.5,0.1])},
  {id:373,name:"Jersey Woollen Jumper",        cat:"🥔 Local Jersey", icon:"🧶",prices:sp(45.0,[0,4,12,10,2])},
  {id:374,name:"Halloumi (225g)",cat:"🥛 Dairy & Eggs",icon:"🧀",prices:sp(2.5,[0.35,-0.11,1.0,0.7,0.18])},
  {id:375,name:"Clotted Cream (113g)",cat:"🥛 Dairy & Eggs",icon:"🍦",prices:sp(2.0,[0.35,0.4,1.0,0.8,0.14])},
  {id:376,name:"Vine Tomatoes (220g)",cat:"🥦 Fruit & Veg",icon:"🍅",prices:sp(1.2,[0.25,0.95,1.3,1.0,0.08])},
  {id:377,name:"Avocados (2pk)",cat:"🥦 Fruit & Veg",icon:"🥑",prices:sp(1.5,[0.25,1.1,1.3,1.1,0.11])},
  {id:378,name:"Florette Salad (125g)",cat:"🥦 Fruit & Veg",icon:"🥗",prices:sp(1.2,[0.15,0.05,0.4,0.25,0.08])},
  {id:379,name:"Fresh Coriander (30g)",cat:"🥦 Fruit & Veg",icon:"🌿",prices:sp(0.65,[0.1,-0.05,0.25,0.15,0.05])},
  {id:380,name:"Fresh Basil (pot)",cat:"🥦 Fruit & Veg",icon:"🌿",prices:sp(1.5,[0.15,0.1,0.5,0.3,0.11])},
  {id:381,name:"Cherries (500g)",cat:"🥦 Fruit & Veg",icon:"🍒",prices:sp(3.0,[0.35,0.5,1.2,0.8,0.21])},
  {id:382,name:"Pears (4pk)",cat:"🥦 Fruit & Veg",icon:"🍐",prices:sp(1.5,[0.15,0.05,0.5,0.3,0.11])},
  {id:383,name:"Strawberry Punnet (400g)",cat:"🥦 Fruit & Veg",icon:"🍓",prices:sp(2.5,[0.25,0.25,0.7,0.4,0.18])},
  {id:384,name:"Seedless Grapes (500g)",cat:"🥦 Fruit & Veg",icon:"🍇",prices:sp(2.2,[0.25,-0.01,0.6,0.35,0.15])},
  {id:385,name:"Burger Buns (4pk)",cat:"🍞 Bread & Bakery",icon:"🍔",prices:sp(1.2,[0.15,0.25,0.6,0.4,0.08])},
  {id:386,name:"Pancakes (6pk)",cat:"🍞 Bread & Bakery",icon:"🥞",prices:sp(1.2,[0.15,0.3,0.6,0.45,0.08])},
  {id:387,name:"Chicken Wings (750g)",cat:"🥩 Meat & Fish",icon:"🍗",prices:sp(3.0,[0.35,0.0,1.0,0.6,0.21])},
  {id:388,name:"Beef Diced (350g)",cat:"🥩 Meat & Fish",icon:"🥩",prices:sp(4.0,[0.45,0.25,1.2,0.7,0.28])},
  {id:389,name:"Beef Sirloin Steak (200g)",cat:"🥩 Meat & Fish",icon:"🥩",prices:sp(4.5,[0.5,-0.5,1.3,0.7,0.32])},
  {id:390,name:"Smoked Haddock (240g)",cat:"🥩 Meat & Fish",icon:"🐟",prices:sp(4.0,[0.45,1.0,1.5,1.0,0.28])},
  {id:391,name:"Cod Portions (240g)",cat:"🥩 Meat & Fish",icon:"🐟",prices:sp(4.0,[0.45,1.0,1.5,1.0,0.28])},
  {id:392,name:"King Prawns (225g)",cat:"🥩 Meat & Fish",icon:"🦐",prices:sp(4.0,[0.45,0.25,1.2,0.7,0.28])},
  {id:393,name:"Wafer Thin Ham (170g)",cat:"🥩 Meat & Fish",icon:"🥩",prices:sp(1.5,[0.15,-0.1,0.5,0.3,0.11])},
  {id:394,name:"Chorizo Ring (200g)",cat:"🥩 Meat & Fish",icon:"🌭",prices:sp(2.8,[0.3,0.2,0.8,0.45,0.2])},
  {id:395,name:"Frozen Berries (500g)",cat:"🧊 Frozen",icon:"🫐",prices:sp(2.5,[0.25,0.25,0.7,0.4,0.18])},
  {id:396,name:"Frozen Hash Browns (700g)",cat:"🧊 Frozen",icon:"🥔",prices:sp(2.0,[0.25,0.2,0.6,0.35,0.14])},
  {id:397,name:"Frozen Waffles (8pk)",cat:"🧊 Frozen",icon:"🧇",prices:sp(1.8,[0.2,-0.01,0.5,0.3,0.13])},
  {id:398,name:"Chopped Tomatoes (4pk)",cat:"🍝 Pantry",icon:"🍅",prices:sp(2.4,[0.25,-0.52,0.6,0.3,0.17])},
  {id:399,name:"Coconut Milk (400ml)",cat:"🍝 Pantry",icon:"🥥",prices:sp(1.2,[0.15,0.1,0.4,0.25,0.08])},
  {id:400,name:"Gravy Granules (200g)",cat:"🍝 Pantry",icon:"🍖",prices:sp(1.5,[0.15,0.1,0.4,0.25,0.11])},
  {id:401,name:"Custard (400g)",cat:"🍝 Pantry",icon:"🍮",prices:sp(1.3,[0.15,0.1,0.4,0.25,0.09])},
  {id:402,name:"Breadcrumbs (400g)",cat:"🍝 Pantry",icon:"🍞",prices:sp(1.2,[0.15,0.05,0.4,0.25,0.08])},
  {id:403,name:"Lemon Juice (250ml)",cat:"🍝 Pantry",icon:"🍋",prices:sp(0.9,[0.1,0.05,0.3,0.2,0.06])},
  {id:404,name:"Tropicana Orange Juice (850ml)",cat:"🥤 Drinks",icon:"🍊",prices:sp(2.5,[0.25,0.0,0.7,0.4,0.18])},
  {id:405,name:"Ribena Squash (850ml)",cat:"🥤 Drinks",icon:"🫐",prices:sp(2.0,[0.25,0.1,0.6,0.35,0.14])},
  {id:406,name:"Coconut Water (1L)",cat:"🥤 Drinks",icon:"🥥",prices:sp(4.0,[0.45,0.0,1.0,0.5,0.28])},
  {id:407,name:"Carex Hand Wash (250ml)",cat:"💊 Health & Beauty",icon:"🧴",prices:sp(1.5,[0.19,0.0,0.4,0.25,0.11])},
  {id:408,name:"Radox Shower Gel (500ml)",cat:"💊 Health & Beauty",icon:"🚿",prices:sp(2.5,[0.25,0.5,0.7,0.4,0.18])},
  {id:409,name:"Dove Body Wash (400ml)",cat:"💊 Health & Beauty",icon:"🚿",prices:sp(2.8,[0.3,0.2,0.8,0.45,0.2])},
  {id:410,name:"Oral-B Toothbrush",cat:"💊 Health & Beauty",icon:"🪥",prices:sp(3.5,[0.35,0.25,1.0,0.6,0.25])},
  {id:411,name:"Listerine Mouthwash (500ml)",cat:"💊 Health & Beauty",icon:"🦷",prices:sp(3.0,[0.15,0.33,0.8,0.45,0.21])},
  {id:412,name:"Comfort Fabric Conditioner (1L)",cat:"🧹 Household",icon:"🧺",prices:sp(2.8,[0.3,0.19,0.8,0.45,0.2])},
  {id:413,name:"Flash All Purpose Spray (500ml)",cat:"🧹 Household",icon:"🧹",prices:sp(1.8,[0.2,0.1,0.5,0.3,0.13])},
  {id:414,name:"Domestos Bleach (750ml)",cat:"🧹 Household",icon:"🧴",prices:sp(1.2,[0.15,0.05,0.4,0.25,0.08])},
  {id:415,name:"Sponge Scourers (5pk)",cat:"🧹 Household",icon:"🧽",prices:sp(1.2,[0.15,0.05,0.4,0.25,0.08])},
  {id:416,name:"Bin Bags (20pk)",cat:"🧹 Household",icon:"🗑️",prices:sp(1.5,[0.15,0.1,0.4,0.25,0.11])},
  {id:417,name:"Foil Roll (30m)",cat:"🧹 Household",icon:"✨",prices:sp(1.8,[0.2,0.1,0.5,0.3,0.13])},
  {id:418,name:"Cling Film (30m)",cat:"🧹 Household",icon:"📦",prices:sp(1.5,[0.15,0.1,0.4,0.25,0.11])},
  {id:419,name:"Baby Wipes (64pk)",cat:"🍼 Baby & Child",icon:"🧻",prices:sp(2.0,[0.25,0.1,0.6,0.35,0.14])},
  {id:420,name:"Sudocrem (125g)",cat:"🍼 Baby & Child",icon:"🧴",prices:sp(3.5,[0.35,0.25,1.0,0.6,0.25])},
  {id:421,name:"Felix Cat Food 12pk",cat:"🐾 Pet Care",icon:"🐱",prices:sp(5.0,[0.55,0.25,1.5,0.85,0.35])},
  {id:422,name:"Pedigree Dog Food (1.5kg)",cat:"🐾 Pet Care",icon:"🐕",prices:sp(4.5,[0.5,0.25,1.3,0.7,0.32])},

  /* ── NEW — verified Co-op Millennium Park receipt 28 May 2026 ─── */
  {id:423,name:"Jersey Dairy Fresh Milk 1% (500ml)", cat:"🥔 Local Jersey", icon:"🥛",prices:sp(0.87,[0,-0.87,-0.87,-0.87,-0.87])},
  {id:430,name:"Jersey Dairy Fresh Milk 1% (1L)",    cat:"🥔 Local Jersey", icon:"🥛",prices:sp(1.65,[-1.65,-1.65,-1.65,0,-1.65])},

  /* ── NEW — verified Waitrose Red Houses receipt 31 May 2026 ─────────── */
  {id:431,name:"Lurpak Salted Spread",               cat:"🥛 Dairy & Eggs", icon:"🧈",prices:sp(3.50,[-3.50,-3.50,-3.50,0,-3.50])},
  {id:432,name:"Pepsi Cream Soda (8pk)",             cat:"🥤 Drinks",       icon:"🥤",prices:sp(5.12,[-5.12,-5.12,-5.12,0,-5.12])},
  {id:433,name:"Ribena Blackcurrant (ready to drink)",cat:"🥤 Drinks",      icon:"🫐",prices:sp(2.44,[-2.44,-2.44,-2.44,0,-2.44])},
  {id:434,name:"Waitrose Cauliflower Cheese",        cat:"🍝 Pantry",       icon:"🧀",prices:sp(4.06,[-4.06,-4.06,-4.06,0,-4.06])},
  {id:435,name:"Waitrose Beef Lasagne",              cat:"🍝 Pantry",       icon:"🍝",prices:sp(4.76,[-4.76,-4.76,-4.76,0,-4.76])},
  {id:436,name:"Waitrose Essential Cheese & Tomato Pizza",cat:"🍝 Pantry",  icon:"🍕",prices:sp(3.17,[-3.17,-3.17,-3.17,0,-3.17])},
  {id:437,name:"Waitrose Essential Potato Salad",    cat:"🥦 Fruit & Veg",  icon:"🥔",prices:sp(1.51,[-1.51,-1.51,-1.51,0,-1.51])},
  {id:438,name:"Waitrose Melton Mowbray Pork Pie",   cat:"🥩 Meat & Fish",  icon:"🥧",prices:sp(3.77,[-3.77,-3.77,-3.77,0,-3.77])},
  {id:439,name:"Peas, Cabbage & Broccoli (frozen)",  cat:"🥦 Fruit & Veg",  icon:"🥦",prices:sp(2.85,[-2.85,-2.85,-2.85,0,-2.85])},
  {id:440,name:"Waitrose Essential Mature Cheddar",  cat:"🥛 Dairy & Eggs", icon:"🧀",prices:sp(5.75,[-5.75,-5.75,-5.75,0,-5.75])},
  {id:441,name:"Walkers Cheese & Onion Crisps",      cat:"🥨 Snacks & Treats",       icon:"🥔",prices:sp(2.40,[-2.40,-2.40,-2.40,0,-2.40])},
  {id:442,name:"Walkers Ready Salted Crisps",        cat:"🥨 Snacks & Treats",       icon:"🥔",prices:sp(2.40,[-2.40,-2.40,-2.40,0,-2.40])},
  {id:443,name:"Alpro Mango Protein Yogurt",         cat:"🥛 Dairy & Eggs", icon:"🥭",prices:sp(1.86,[-1.86,-1.86,-1.86,0,-1.86])},
  {id:444,name:"Muller Corner Fruit Yogurt",         cat:"🥛 Dairy & Eggs", icon:"🍓",prices:sp(3.68,[-3.68,-3.68,-3.68,0,-3.68])},
  {id:445,name:"Waitrose Essential Mineral Water",   cat:"🥤 Drinks",       icon:"💧",prices:sp(1.69,[-1.69,-1.69,-1.69,0,-1.69])},
  {id:446,name:"Waitrose Chocolate Raisins",         cat:"🥨 Snacks & Treats",       icon:"🍫",prices:sp(2.09,[-2.09,-2.09,-2.09,0,-2.09])},
  {id:447,name:"Waitrose Wine Gums",                 cat:"🥨 Snacks & Treats",       icon:"🍬",prices:sp(1.34,[-1.34,-1.34,-1.34,0,-1.34])},
  {id:448,name:"Waitrose No.1 Sea Salt Crisps",      cat:"🥨 Snacks & Treats",       icon:"🧂",prices:sp(1.64,[-1.64,-1.64,-1.64,0,-1.64])},
  {id:424,name:"Jersey Dairy Fresh Milk 2.5% (500ml)",cat:"🥔 Local Jersey",icon:"🥛",prices:sp(0.87,[0,-0.87,-0.87,-0.87,-0.87])},
  {id:425,name:"Cornish Pasty",                    cat:"🍝 Pantry",       icon:"🥟",prices:sp(2.80,[0,0,0,0,0])},
  {id:426,name:"Chicken & Bacon Pasty",            cat:"🍝 Pantry",       icon:"🥟",prices:sp(2.80,[0,0,0,0,0])},
  {id:427,name:"Dauphinoise Potatoes (400g)",      cat:"🍝 Pantry",       icon:"🥔",prices:sp(3.65,[0,0,0,0,0])},
  {id:428,name:"Unsmoked Back Bacon (300g)",       cat:"🥩 Meat & Fish",  icon:"🥓",prices:sp(3.49,[0,0,0,0,0])},
  {id:429,name:"Jacobs Twiglets (6x23g)",          cat:"🥨 Snacks & Treats",       icon:"🥨",prices:sp(2.55,[-2.55,-2.55,-2.55,0,-2.55])},

  /* ── NEW — verified Waitrose St Helier receipt 30 May 2026 ─────────── */
  {id:449,name:"7UP Zero (4pk)",                     cat:"🥤 Drinks",       icon:"🥤",prices:sp(4.23,[-4.23,-4.23,-4.23,0,-4.23])},
  {id:450,name:"Waitrose Essential Double Cream",    cat:"🥛 Dairy & Eggs", icon:"🍦",prices:sp(1.51,[-1.51,-1.51,-1.51,0,-1.51])},
  {id:451,name:"Waitrose Essential Back Bacon (10)", cat:"🥩 Meat & Fish",  icon:"🥓",prices:sp(3.19,[-3.19,-3.19,-3.19,0,-3.19])},
  {id:452,name:"Waitrose Frozen Quarter Pounder",    cat:"🧊 Frozen",       icon:"🍔",prices:sp(4.60,[-4.60,-4.60,-4.60,0,-4.60])},
  {id:453,name:"McCain Southern Fries",              cat:"🧊 Frozen",       icon:"🍟",prices:sp(2.90,[-2.90,-2.90,-2.90,0,-2.90])},
];

/* ═══════════════════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════════════════ */
const getBestPrice   = (p, disabled=new Set()) => { const vals=Object.entries(p.prices).filter(([k,v])=>!disabled.has(k)&&v>0).map(([,v])=>v); return vals.length?Math.min(...vals):0; };
const getWorstPrice  = (p, disabled=new Set()) => { const vals=Object.entries(p.prices).filter(([k,v])=>!disabled.has(k)&&v>0).map(([,v])=>v); return vals.length?Math.max(...vals):0; };
const getBestStoreId = (p, disabled=new Set()) => { const b=getBestPrice(p,disabled); return Object.entries(p.prices).find(([k,v])=>!disabled.has(k)&&v===b&&v>0)?.[0]; };
const getSortedPrices= (p, disabled=new Set()) => Object.entries(p.prices).filter(([k,v])=>!disabled.has(k)&&v>0).sort(([,a],[,b])=>a-b);

const ICON_OPTIONS = ["🛒","🥛","🥚","🧀","🧈","🍞","🥖","🥐","🍗","🥩","🥓","🐟","🍌","🍎","🥦","🥬","🫑","🥕","🍅","🥑","🍊","💧","☕","🍷","🍺","🍝","🍚","🫒","🧴","🧻","🪥","💊","🧹","🥔","🦀","🍦","🍯","🍕","🍟","🍨","🥨","🍫","🥜","🫧","🧼","💨","🍶","🌾","🫘","🌭","🥤","🍸","🧅","🧄","🥒","🍋","🍄","🍓","🫐","🍾","🥂","🍩","🦞","🍏","🍇","🌻","🐶","🐱","🦴","🍼","🩸","💊","🩹","🌸","🏷️","⚡","🥂","🥃","🌮","🥙","🍬","🍿","🥝","🍍","🥭","🌶️","🍠","🍈","🍆","🎃","🌽","🧇","🥞","🥯","🍳"];

/* ═══════════════════════════════════════════════════════════════════════════
   TOOLTIP — shows full text on hover when content is truncated
═══════════════════════════════════════════════════════════════════════════ */
function Tooltip({ text, children }) {
  const [visible,  setVisible]  = useState(false);
  const [pos,      setPos]      = useState({ x:0, y:0, above:false });
  const [isTrunc,  setIsTrunc]  = useState(false);
  const elRef = useRef(null);
  const tipRef= useRef(null);

  const checkTrunc = () => {
    const el = elRef.current;
    if (el) setIsTrunc(el.scrollWidth > el.clientWidth + 1);
  };

  const show = (e) => {
    checkTrunc();
    const el = elRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const tipW = 220;
    const spaceBelow = window.innerHeight - rect.bottom;
    const above = spaceBelow < 70;
    // centre the tip over the element, clamp to viewport
    let x = rect.left + rect.width / 2 - tipW / 2;
    x = Math.max(8, Math.min(x, window.innerWidth - tipW - 8));
    const y = above ? rect.top - 8 : rect.bottom + 6;
    setPos({ x, y, above });
    setVisible(true);
  };

  const hide = () => setVisible(false);

  // also recalc on resize
  useEffect(() => {
    window.addEventListener("resize", checkTrunc);
    checkTrunc();
    return () => window.removeEventListener("resize", checkTrunc);
  }, [text]);

  return (
    <>
      <div
        ref={elRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onTouchStart={show}
        onTouchEnd={()=>setTimeout(hide,1800)}
        style={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", cursor: isTrunc ? "help" : "default" }}
      >
        {children}
      </div>

      {/* Portal-style tooltip rendered at fixed position */}
      {visible && isTrunc && (
        <div
          ref={tipRef}
          style={{
            position:"fixed",
            left: pos.x,
            top: pos.above ? "auto" : pos.y,
            bottom: pos.above ? window.innerHeight - pos.y : "auto",
            width: 220,
            background:"#1e293b",
            border:"1px solid rgba(34,197,94,.35)",
            borderRadius:9,
            padding:"8px 12px",
            fontSize:12,
            fontWeight:600,
            color:"#f0f4f8",
            lineHeight:1.4,
            zIndex:9999,
            boxShadow:"0 8px 32px rgba(0,0,0,.6)",
            pointerEvents:"none",
            wordBreak:"break-word",
            whiteSpace:"normal",
          }}
        >
          {/* little arrow */}
          <div style={{
            position:"absolute",
            left: "50%", transform:"translateX(-50%)",
            ...(pos.above
              ? { bottom:-5, borderTop:"5px solid #1e293b",    borderLeft:"5px solid transparent", borderRight:"5px solid transparent" }
              : { top:-5,    borderBottom:"5px solid #1e293b", borderLeft:"5px solid transparent", borderRight:"5px solid transparent" }),
            width:0, height:0,
          }}/>
          {text}
        </div>
      )}
    </>
  );
}


function ProductCard({ product, onAddToBasket, pinnedStore, isFavourite, onToggleFavourite, disabledStores=new Set() }) {
  const [open, setOpen]             = useState(false);
  // manualOverride tracks if the user explicitly picked a store via the dropdown
  const [manualOverride, setManualOverride] = useState(null);

  const sorted     = getSortedPrices(product, disabledStores);
  const bestPrice  = sorted[0]?.[1] ?? 0;
  const bestId     = sorted[0]?.[0];

  // Priority: manual override > global pin > cheapest
  const effectiveStoreId = manualOverride && !disabledStores.has(manualOverride)
    ? manualOverride
    : pinnedStore && product.prices[pinnedStore] !== undefined && !disabledStores.has(pinnedStore)
      ? pinnedStore
      : bestId;

  const chosenStoreId = effectiveStoreId;
  const chosenPrice= product.prices[chosenStoreId] ?? 0;
  const chosenStore= STORES.find(s=>s.id===chosenStoreId);
  const saving     = getWorstPrice(product,disabledStores)-bestPrice;
  const overBest   = chosenPrice-bestPrice;
  const isOnBest   = chosenStoreId===bestId;

  // When global pin changes, clear any manual override
  const prevPin = useRef(pinnedStore);
  useEffect(()=>{
    if(prevPin.current !== pinnedStore) { setManualOverride(null); prevPin.current = pinnedStore; }
  },[pinnedStore]);

  return (
    <div style={{ background:"linear-gradient(180deg,rgba(255,255,255,.06) 0%,rgba(255,255,255,.03) 100%)", border:`1px solid ${product.custom?"rgba(34,197,94,.25)":"rgba(255,255,255,.1)"}`, borderRadius:16, overflow:"visible", transition:"box-shadow .15s", boxShadow:"0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.08)" }}
      onMouseEnter={e=>{e.currentTarget.style.boxShadow="0 8px 28px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.1)";}}
      onMouseLeave={e=>{e.currentTarget.style.boxShadow="0 4px 16px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.08)";}}>

      {/* main row */}
      <div style={{ padding:"12px 14px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:9 }}>
          <span style={{ fontSize:22, flexShrink:0, filter:"drop-shadow(0 1px 3px rgba(0,0,0,0.5))" }}>{product.icon}</span>
          <div style={{ flex:1, minWidth:0 }}>
            <Tooltip text={product.name}>
              <div style={{ fontSize:12.5, fontWeight:700, color:"#f0f4f8", lineHeight:1.3 }}>{product.name}</div>
            </Tooltip>
            <div style={{ marginTop:3, display:"flex", alignItems:"center", gap:4, flexWrap:"wrap" }}>
              <span style={{ fontSize:9, fontWeight:600, color:"#64748b", background:"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.09)", borderRadius:5, padding:"1px 6px", letterSpacing:".3px" }}>{product.cat}</span>
              {product.custom&&<span style={{ fontSize:9, color:"#4ade80", background:"rgba(34,197,94,.1)", border:"1px solid rgba(34,197,94,.2)", borderRadius:5, padding:"1px 6px" }}>custom</span>}
            </div>
          </div>
          {/* heart / favourite button */}
          <button
            onClick={e=>{ e.stopPropagation(); onToggleFavourite(product.id); }}
            title={isFavourite?"Remove from favourites":"Add to favourites"}
            style={{ flexShrink:0, background:"none", border:"none", cursor:"pointer", fontSize:18, lineHeight:1, padding:"2px 4px", transition:"transform .15s", color:isFavourite?"#f43f5e":"rgba(255,255,255,.2)" }}
            onMouseEnter={e=>{ e.currentTarget.style.transform="scale(1.25)"; e.currentTarget.style.color=isFavourite?"#fb7185":"rgba(244,63,94,.7)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.transform="scale(1)";    e.currentTarget.style.color=isFavourite?"#f43f5e":"rgba(255,255,255,.2)"; }}
          >{isFavourite?"♥":"♡"}</button>
          <div style={{ textAlign:"right", flexShrink:0 }}>
            <div style={{ fontSize:19, fontWeight:800, color:isOnBest?"#4ade80":"#fbbf24", lineHeight:1, textShadow:isOnBest?"0 0 10px rgba(74,222,128,0.4)":"0 0 10px rgba(251,191,36,0.4)" }}>£{chosenPrice.toFixed(2)}</div>
            {!isOnBest && <div style={{ fontSize:8.5, color:"#f87171", marginTop:1 }}>+£{overBest.toFixed(2)} vs best</div>}
            {isOnBest && saving>0.09 && <div style={{ fontSize:8.5, color:"#86efac", marginTop:1 }}>saves £{saving.toFixed(2)}</div>}
          </div>
        </div>

        {/* store pill + add */}
        <div style={{ display:"flex", alignItems:"center", gap:8, paddingBottom:11 }}>
          {(() => {
            const sc = chosenStore?.color || "#22c55e";
            const r=parseInt(sc.slice(1,3),16), g=parseInt(sc.slice(3,5),16), b=parseInt(sc.slice(5,7),16);
            return (
              <button onClick={()=>setOpen(o=>!o)} style={{
                flex:1, display:"flex", alignItems:"center", justifyContent:"space-between",
                background: `linear-gradient(180deg,rgba(${r},${g},${b},0.18) 0%,rgba(${r},${g},${b},0.1) 100%)`,
                border: `1px solid rgba(${r},${g},${b},0.4)`,
                borderRadius:9, padding:"7px 10px", cursor:"pointer", gap:5,
                boxShadow:`inset 0 1px 0 rgba(255,255,255,.1)`,
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <span style={{ fontSize:13 }}>{chosenStore?.emoji}</span>
                  <span style={{ fontSize:10.5, fontWeight:700, color:`rgb(${Math.min(255,r+80)},${Math.min(255,g+80)},${Math.min(255,b+80)})` }}>{chosenStore?.name}</span>
                  {isOnBest && <span style={{ fontSize:8, background:`rgba(${r},${g},${b},0.3)`, color:sc, borderRadius:4, padding:"1px 5px", fontWeight:700, border:`1px solid rgba(${r},${g},${b},0.4)` }}>BEST</span>}
                </div>
                <span style={{ fontSize:16, color:sc, display:"inline-block", transition:"transform .2s", transform:open?"rotate(180deg)":"none", lineHeight:1 }}>▾</span>
              </button>
            );
          })()}
          <button onClick={()=>onAddToBasket(product.id,chosenStoreId)} style={{
            flexShrink:0, position:"relative", overflow:"hidden",
            background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",
            border:"none", borderRadius:9, padding:"7px 14px",
            color:"#052e16", cursor:"pointer", fontSize:12.5, fontWeight:700, whiteSpace:"nowrap",
            boxShadow:"0 2px 8px rgba(34,197,94,.5), inset 0 1px 0 rgba(255,255,255,.3)",
          }}>
            <span style={{ position:"absolute", top:0, left:0, right:0, height:"52%", background:"linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.04) 100%)", borderRadius:"9px 9px 0 0", pointerEvents:"none" }} />
            + Add
          </button>
        </div>
      </div>

      {/* dropdown */}
      {open && (
        <div style={{ borderTop:"1px solid rgba(255,255,255,.07)", background:"rgba(0,0,0,.35)", borderRadius:"0 0 16px 16px", overflow:"hidden" }}>
          {sorted.map(([sid,price],idx)=>{
            const store    = STORES.find(s=>s.id===sid);
            const isBest   = idx===0;
            const isSel    = sid===chosenStoreId;
            const diff     = price-bestPrice;
            const pct      = Math.round((diff/bestPrice)*100);
            const sc       = store?.color||"#22c55e";
            return (
              <button key={sid} onClick={()=>{setManualOverride(sid);setOpen(false);}} style={{
                width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
                padding:"9px 14px", border:"none", cursor:"pointer", textAlign:"left",
                background: isSel ? `linear-gradient(90deg,${sc}22 0%,${sc}08 100%)` : idx%2===0?"rgba(255,255,255,.02)":"rgba(0,0,0,.1)",
                borderLeft: `3px solid ${isSel?sc:"transparent"}`,
                transition:"background .1s",
                boxShadow: isSel ? `inset 0 1px 0 rgba(255,255,255,.05)` : "none",
              }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <span style={{ fontSize:15 }}>{store?.emoji}</span>
                  <div>
                    <div style={{ fontSize:11, fontWeight:600, color:isSel?sc:"#e2e8f0", display:"flex", alignItems:"center", gap:5, flexWrap:"wrap" }}>
                      {store?.name}
                      {isBest && <span style={{ fontSize:8, background:`${sc}33`, color:sc, borderRadius:4, padding:"1px 5px", fontWeight:700, border:`1px solid ${sc}55` }}>CHEAPEST</span>}
                      {isSel && !isBest && <span style={{ fontSize:8, background:"rgba(251,191,36,.15)", color:"#fcd34d", borderRadius:4, padding:"1px 5px" }}>SELECTED</span>}
                    </div>
                    <div style={{ fontSize:8.5, color:"#475569", marginTop:1 }}>{store?.note}</div>
                  </div>
                </div>
                <div style={{ textAlign:"right", flexShrink:0 }}>
                  <div style={{ fontSize:14, fontWeight:800, color:isBest?sc:isSel?"#fcd34d":"#cbd5e1" }}>£{price.toFixed(2)}</div>
                  {pct>0 ? <div style={{ fontSize:8.5, color:"#f87171" }}>+{pct}% · +£{diff.toFixed(2)}</div>
                         : <div style={{ fontSize:8.5, color:sc }}>best price</div>}
                </div>
              </button>
            );
          })}
          <div style={{ padding:"7px 14px", fontSize:9, color:"#334155", fontStyle:"italic", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <span>Tap a store to override for this item</span>
            {manualOverride && <button onClick={()=>setManualOverride(null)} style={{ background:"rgba(251,191,36,.15)",border:"none",color:"#fcd34d",fontSize:8.5,fontWeight:700,borderRadius:4,padding:"2px 7px",cursor:"pointer" }}>Reset ↺</button>}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Formspree form ID ───────────────────────────────────────────────────────
const FORMSPREE_ID = "mvzyrgqj";

/* ═══════════════════════════════════════════════════════════════════════════
   JUNE COMPETITION — update LEADERBOARD entries below each week
   Format: { name: "First L", count: 12 }   ← first name + last initial only
   Set COMP_WINNER to "" while competition is live, or "First L" when decided.
   Set COMP_ACTIVE to false after 30 June to hide the banner.
═══════════════════════════════════════════════════════════════════════════ */
const COMP_ACTIVE = true;
const COMP_WINNER = ""; // e.g. "Sarah M" — leave blank while competition is live

/* ─── MAINTENANCE MODE — set to true to show "back shortly" screen ─── */
const MAINTENANCE = false;
const LEADERBOARD = [
  // ── TOP 5 — update these entries with real submissions ──────────────────
  // { name: "Sarah M",  count: 24 },
  // { name: "James O",  count: 18 },
  // { name: "Claire B", count: 15 },
  // { name: "Tom H",    count: 9  },
  // { name: "Ruth K",   count: 7  },
  // ── Remove the // at the start of each line above to activate ────────────
];

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN APP
═══════════════════════════════════════════════════════════════════════════ */
export default function JerseyGroceryApp() {

  const [allProducts]                        = useState(BASE_PRODUCTS);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery]       = useState("");
  const [basket, setBasket]                 = useState({});
  const [pinnedStore, setPinnedStore]       = useState(null);
  const [sortBy, setSortBy]                 = useState("bestPrice");
  const [view, setView]                     = useState("shop");
  const [showEnquiry,    setShowEnquiry]    = useState(false);
  const [showAddModal,   setShowAddModal]   = useState(false);
  const [showHelp,       setShowHelp]       = useState(false);
  const [showReport,     setShowReport]     = useState(false);
  const [showSettings,   setShowSettings]   = useState(false);
  const [disabledStores, setDisabledStores] = useState(new Set());
  const [showCompetition,  setShowCompetition]  = useState(false);
  const [showSubmitPrice,  setShowSubmitPrice]  = useState(false);


  const toggleStore = (storeId) => {
    setDisabledStores(prev => {
      const next = new Set(prev);
      if (next.has(storeId)) { next.delete(storeId); } else { next.add(storeId); }
      if (next.has(storeId) && pinnedStore === storeId) setPinnedStore(null);
      return next;
    });
  };

  const activeStores = STORES.filter(s => !disabledStores.has(s.id));

  // Show welcome screen every time the app loads
  const [showWelcome, setShowWelcome] = useState(true);

  const dismissWelcome = () => {
    setShowWelcome(false);
  };
  const [newItem, setNewItem]               = useState({ name:"", cat:"➕ Custom", icon:"🛒", prices:{coop:"",morrisons:"",ms:"",waitrose:"",iceland:""} });
  const [iconPickerOpen, setIconPickerOpen] = useState(false);
  const [addError, setAddError]             = useState("");
  const [toast, setToast] = useState(null);
  const [favourites, setFavourites]         = useState(new Set());
  const [favBasket,  setFavBasket]          = useState({});

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(()=>setToast(null), 3000);
  };

  /* persist basket + favourites to localStorage (survives app restart) */
  useEffect(()=>{
    try {
      const b = localStorage.getItem("jb_basket");      if(b) setBasket(JSON.parse(b));
      const f = localStorage.getItem("jb_favourites");  if(f) setFavourites(new Set(JSON.parse(f)));
      const fb= localStorage.getItem("jb_fav_basket");  if(fb) setFavBasket(JSON.parse(fb));
    } catch{}
  },[]);
  useEffect(()=>{ try{localStorage.setItem("jb_basket",JSON.stringify(basket));}catch{} },[basket]);
  useEffect(()=>{ try{localStorage.setItem("jb_favourites",JSON.stringify([...favourites]));}catch{} },[favourites]);
  useEffect(()=>{ try{localStorage.setItem("jb_fav_basket",JSON.stringify(favBasket));}catch{} },[favBasket]);

  const toggleFavourite = useCallback((pid)=>{
    setFavourites(prev=>{
      const next = new Set(prev);
      if(next.has(pid)){ next.delete(pid); } else { next.add(pid); }
      return next;
    });
  },[]);

  const addToFavBasket    = useCallback((pid,sid)=>setFavBasket(p=>{const k=`${pid}-${sid}`;return{...p,[k]:(p[k]||0)+1};}), []);
  const removeFromFavBasket   = useCallback(key=>setFavBasket(p=>{const n={...p};n[key]>1?n[key]--:delete n[key];return n;}), []);
  const deleteFromFavBasket   = useCallback(key=>setFavBasket(p=>{const n={...p};delete n[key];return n;}), []);

  const filteredProducts = useMemo(()=>{
    let list = allProducts;
    if(activeCategory!=="All") list = list.filter(p=>p.cat===activeCategory);
    if(searchQuery) list = list.filter(p=>p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if(pinnedStore) list = list.filter(p=>p.prices[pinnedStore]!==undefined);
    if(sortBy==="bestPrice") return [...list].sort((a,b)=>getBestPrice(a,disabledStores)-getBestPrice(b,disabledStores));
    if(sortBy==="savings")   return [...list].sort((a,b)=>(getWorstPrice(b,disabledStores)-getBestPrice(b,disabledStores))-(getWorstPrice(a,disabledStores)-getBestPrice(a,disabledStores)));
    if(sortBy==="az")        return [...list].sort((a,b)=>a.name.localeCompare(b.name));
    if(sortBy==="cat")       return [...list].sort((a,b)=>{const s=x=>x.replace(/^\S+\s/,"");return s(a.cat).localeCompare(s(b.cat))||a.name.localeCompare(b.name);});
    return list;
  },[allProducts,activeCategory,searchQuery,pinnedStore,sortBy,disabledStores]);

  const addToBasket    = useCallback((pid,sid)=>setBasket(p=>{const k=`${pid}-${sid}`;return{...p,[k]:(p[k]||0)+1};}), []);
  const removeFromBasket   = useCallback(key=>setBasket(p=>{const n={...p};n[key]>1?n[key]--:delete n[key];return n;}), []);
  const deleteFromBasket   = useCallback(key=>setBasket(p=>{const n={...p};delete n[key];return n;}), []);

  const basketItems = useMemo(()=>Object.entries(basket).map(([key,qty])=>{
    const[pId,sId]=key.split("-");
    const product=allProducts.find(p=>p.id===parseInt(pId));
    if(!product)return null;
    return{key,product,store:STORES.find(s=>s.id===sId),qty,price:product.prices[sId]};
  }).filter(Boolean),[basket,allProducts]);

  const basketTotal    = basketItems.reduce((s,i)=>s+i.price*i.qty,0);
  const basketCount    = Object.values(basket).reduce((a,b)=>a+b,0);
  const favCount       = favourites.size;
  const favBasketCount = Object.values(favBasket).reduce((a,b)=>a+b,0);
  const optimalTotal   = basketItems.reduce((s,i)=>s+getBestPrice(i.product,disabledStores)*i.qty,0);
  const potentialSave  = basketTotal-optimalTotal;

  const storeBasketTotals = useMemo(()=>STORES.map(store=>({
    store, total:basketItems.reduce((s,item)=>s+(item.product.prices[store.id]??0)*item.qty,0)
  })).sort((a,b)=>a.total-b.total),[basketItems]);

  const catCounts = useMemo(()=>{
    const m={All:allProducts.length};
    allProducts.forEach(p=>{m[p.cat]=(m[p.cat]||0)+1;});
    return m;
  },[allProducts]);

  const liveVals   = STORES.map(s=>parseFloat(newItem.prices[s.id])).filter(v=>!isNaN(v)&&v>0);
  const liveMin    = liveVals.length?Math.min(...liveVals):null;

  const [addItemStatus, setAddItemStatus] = useState("idle"); // idle | sending | sent | error

  const submitNewItem = async ()=>{
    if(!newItem.name.trim()){setAddError("Please enter a product name.");return;}
    const filled=Object.entries(newItem.prices).filter(([,v])=>v!=="");
    if(!filled.length){setAddError("Enter at least one store price.");return;}
    for(const[,v]of filled){if(isNaN(parseFloat(v))||parseFloat(v)<0){setAddError("Prices must be positive numbers.");return;}}

    setAddItemStatus("sending");
    const priceLines = filled.map(([k,v])=>`${STORES.find(s=>s.id===k)?.name}: £${parseFloat(v).toFixed(2)}`).join("\n");

    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify({
          _subject:`New Product Submission — JerseyBasket.je`,
          product_name: newItem.name.trim(),
          category: newItem.cat,
          prices: priceLines,
          message:`A customer has submitted a new product for review.\n\nProduct: ${newItem.name.trim()}\nCategory: ${newItem.cat}\n\nPrices submitted:\n${priceLines}\n\nPlease verify in-store and add to the app if correct.`,
        })
      });
      if(res.ok){ setAddItemStatus("sent"); setAddError(""); }
      else { setAddItemStatus("error"); }
    } catch { setAddItemStatus("error"); }
  };

  /* ── RENDER ─────────────────────────────────────────────────────── */
  if (MAINTENANCE) return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#050d1a 0%,#0b1c35 55%,#061220 100%)", fontFamily:"'Georgia',serif", color:"#f0f4f8", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ textAlign:"center", maxWidth:400 }}>
        <div style={{ fontSize:64, marginBottom:20 }}>🛠️</div>
        <div style={{ fontSize:24, fontWeight:700, color:"#22c55e", marginBottom:10 }}>Back Shortly!</div>
        <div style={{ fontSize:15, color:"#94a3b8", lineHeight:1.7, marginBottom:24 }}>
          JerseyBasket is currently being updated with new prices and features.
          <br/>We'll be back in just a few minutes. 🇯🇪
        </div>
        <div style={{ fontSize:12, color:"#475569" }}>
          Questions? Email <a href="mailto:hello@jerseybasket.je" style={{ color:"#22c55e" }}>hello@jerseybasket.je</a>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(160deg,#050d1a 0%,#0b1c35 55%,#061220 100%)", fontFamily:"'Georgia',serif", color:"#f0f4f8" }}>
      <div style={{ position:"fixed",inset:0,pointerEvents:"none",zIndex:0, background:"radial-gradient(ellipse 80% 60% at 15% 5%,rgba(0,180,100,.05) 0%,transparent 60%),radial-gradient(ellipse 60% 80% at 85% 95%,rgba(0,100,220,.06) 0%,transparent 60%)" }} />

      {/* ══ HEADER ══ */}
      <header style={{ position:"sticky",top:0,zIndex:100, background:"rgba(5,13,26,.96)",backdropFilter:"blur(20px)", borderBottom:"1px solid rgba(255,255,255,.07)",padding:"0 12px",paddingTop:"env(safe-area-inset-top,0px)" }}>
        <div style={{ maxWidth:1040,margin:"0 auto" }}>
          {/* ── ROW 1: logo + icon buttons ── */}
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",paddingTop:10,paddingBottom:7,gap:6 }}>
            <div style={{ display:"flex",alignItems:"center",gap:7,minWidth:0,flexShrink:1 }}>
              <span style={{ fontSize:20,flexShrink:0,filter:"drop-shadow(0 2px 4px rgba(34,197,94,0.4))" }}>🛍️</span>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:14,fontWeight:700,letterSpacing:"-0.5px",lineHeight:1.1,whiteSpace:"nowrap" }}>
                  Jersey<span style={{ color:"#4ade80",textShadow:"0 0 12px rgba(74,222,128,0.6)" }}>Basket</span>
                </div>
                <div style={{ display:"flex",alignItems:"center",gap:5,marginTop:3 }}>
                  <span style={{ fontSize:8.5,color:"#475569",letterSpacing:".8px" }}>CHANNEL ISLANDS</span>
                  <span style={{ width:3,height:3,borderRadius:"50%",background:"#334155",display:"inline-block",flexShrink:0 }}/>
                  <span style={{ fontSize:10,fontWeight:700,background:"linear-gradient(180deg,#4ade80 0%,#16a34a 100%)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",backgroundClip:"text" }}>{allProducts.length} products</span>
                  <span style={{ fontSize:8.5,background:"linear-gradient(180deg,#60a5fa 0%,#1d4ed8 100%)",color:"#fff",borderRadius:5,padding:"1px 5px",fontWeight:700,boxShadow:"0 1px 4px rgba(37,99,235,0.5)",flexShrink:0 }}>LIVE</span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex",gap:4,alignItems:"center",flexShrink:0 }}>
              {/* Share */}
              <button onClick={()=>{
                const shareData = { title:"JerseyBasket.je", text:"Compare grocery prices across all Jersey supermarkets! 🇯🇪", url:"https://jerseybasket.je" };
                if (navigator.share) { navigator.share(shareData).catch(()=>{}); }
                else { navigator.clipboard.writeText("https://jerseybasket.je").then(()=>showToast("🔗 Link copied!")); }
              }} title="Share JerseyBasket"
              style={{ WebkitAppearance:"none",appearance:"none",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.18)",borderRadius:9,width:32,height:32,color:"#7dd3fc",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,boxShadow:"0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                🔗
              </button>
              {/* Report */}
              <button onClick={()=>setShowReport(true)} title="Report a problem"
              style={{ WebkitAppearance:"none",appearance:"none",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.18)",borderRadius:9,width:32,height:32,color:"#7dd3fc",cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,boxShadow:"0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                🚩
              </button>
              {/* Help */}
              <button onClick={()=>setShowHelp(true)} title="Help"
              style={{ WebkitAppearance:"none",appearance:"none",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.18)",borderRadius:9,width:32,height:32,color:"#7dd3fc",cursor:"pointer",fontSize:14,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,boxShadow:"0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                ?
              </button>
              {/* Settings */}
              <button onClick={()=>setShowSettings(true)} title="Settings"
              style={{ WebkitAppearance:"none",appearance:"none",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.18)",borderRadius:9,width:32,height:32,color:"#7dd3fc",cursor:"pointer",fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,padding:0,boxShadow:"0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.1)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                ⚙️
              </button>
            </div>
          </div>
          {/* ── ROW 2: nav tabs + add button ── */}
          <div style={{ display:"flex",gap:3,paddingBottom:9,alignItems:"center" }}>
            {[["shop","🛒 Shop"],["basket","🧺 Basket"],["favourites",`♥ Saved${favCount>0?" ("+favCount+")":""}`],["compare","📊 Stores"]].map(([v,lbl])=>{
              const isActive = view===v;
              const isFav = v==="favourites";
              return (
                <button key={v} onClick={()=>setView(v)} style={{
                  WebkitAppearance:"none",appearance:"none",
                  background: isActive ? (isFav?"linear-gradient(180deg,#fb7185 0%,#be123c 100%)":"linear-gradient(180deg,#4ade80 0%,#15803d 100%)") : "linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",
                  border: isActive ? (isFav?"1px solid rgba(251,113,133,.5)":"1px solid rgba(74,222,128,.5)") : "1px solid rgba(125,211,252,0.15)",
                  color: isActive ? (isFav?"#fff":"#052e16") : "#7dd3fc",
                  borderRadius:22, padding:"6px 11px", cursor:"pointer", fontSize:11, fontWeight:700,
                  flexShrink:0, position:"relative", overflow:"hidden",
                  boxShadow: isActive ? (isFav?"0 3px 10px rgba(190,18,60,.5),inset 0 1px 0 rgba(255,255,255,.25)":"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.25)") : "0 2px 6px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.07)",
                }}>
                  <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"22px 22px 0 0",pointerEvents:"none" }}/>
                  {lbl}
                </button>
              );
            })}
            <button onClick={()=>setShowAddModal(true)} style={{
              WebkitAppearance:"none",appearance:"none",marginLeft:"auto",
              background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",
              border:"none",borderRadius:9,padding:"6px 12px",
              color:"#052e16",cursor:"pointer",fontSize:11,fontWeight:700,whiteSpace:"nowrap",flexShrink:0,
              boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",
              position:"relative",overflow:"hidden",
            }}>
              <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
              + Add
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth:1040,margin:"0 auto",padding:"0 16px calc(10vh + 60px)",position:"relative",zIndex:1 }}>

        {/* ══════════════════════════ SHOP ══════════════════════════ */}
        {view==="shop" && (
          <div>
            {/* ── PRICE DISCLAIMER BANNER ── */}
            <div style={{ margin:"14px 0 10px",background:"rgba(245,158,11,.08)",border:"1px solid rgba(245,158,11,.28)",borderRadius:11,padding:"10px 14px",display:"flex",gap:10,alignItems:"flex-start" }}>
              <span style={{ fontSize:18,flexShrink:0,marginTop:1 }}>⚠️</span>
              <div style={{ fontSize:11,color:"#fcd34d",lineHeight:1.6 }}>
                <strong>Prices are currently approximate.</strong> We are actively verifying all prices in-store across all 5 Jersey supermarkets. Some prices may differ from what you see on the shelf.
                {" "}<span style={{ color:"#f59e0b" }}>Always verify in-store before you shop.</span>
              </div>
            </div>

            {/* hint */}
            <div style={{ margin:"14px 0 12px",background:"rgba(59,130,246,.09)",border:"1px solid rgba(59,130,246,.22)",borderRadius:11,padding:"9px 13px",display:"flex",gap:9,alignItems:"center" }}>
              <span style={{ fontSize:16,flexShrink:0 }}>💡</span>
              <div style={{ fontSize:11,color:"#93c5fd",lineHeight:1.5 }}>
                <strong>Each item shows the cheapest price.</strong> Tap the store pill to switch to a different store — then hit <strong>+ Add</strong> to add to basket.
              </div>
            </div>

            {/* search + sort */}
            <div style={{ display:"flex",gap:9,marginBottom:11,flexWrap:"wrap" }}>
              <div style={{ flex:1,minWidth:160,position:"relative" }}>
                <span style={{ position:"absolute",left:11,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none" }}>🔍</span>
                <input
                  value={searchQuery}
                  onChange={e=>setSearchQuery(e.target.value)}
                  onKeyDown={e=>{ if(e.key==="Escape") setSearchQuery(""); }}
                  placeholder={`Search ${allProducts.length} products…`}
                  inputMode="search"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  style={{ width:"100%",padding:"8px 32px 8px 34px",background:"rgba(255,255,255,.06)",border:`1px solid ${searchQuery?"rgba(34,197,94,.4)":"rgba(255,255,255,.10)"}`,borderRadius:9,color:"#fff",fontSize:16,outline:"none",boxSizing:"border-box",transition:"border-color .2s",WebkitAppearance:"none" }}
                />
                {searchQuery && (
                  <button
                    onClick={()=>setSearchQuery("")}
                    title="Clear search"
                    style={{ position:"absolute",right:8,top:"50%",transform:"translateY(-50%)",background:"rgba(255,255,255,.12)",border:"none",borderRadius:"50%",width:18,height:18,color:"#94a3b8",cursor:"pointer",fontSize:11,display:"flex",alignItems:"center",justifyContent:"center",lineHeight:1,fontWeight:700,transition:"background .15s" }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(239,68,68,.25)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,.12)"}
                  >✕</button>
                )}
              </div>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ padding:"8px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.10)",borderRadius:9,color:"#fff",fontSize:11,cursor:"pointer",outline:"none" }}>
                <option value="bestPrice">Sort: Cheapest First</option>
                <option value="savings">Sort: Biggest Saving</option>
                <option value="az">Sort: A–Z</option>
                <option value="cat">Sort: Category</option>
              </select>
            </div>

            {/* store filter */}
            <div style={{ display:"flex",gap:6,flexWrap:"wrap",paddingBottom:7,marginBottom:4 }}>
              <Chip active={!pinnedStore} onClick={()=>setPinnedStore(null)} color="#3b82f6">🏷️ Best Price</Chip>
              {activeStores.map(s=>(
                <Chip key={s.id} active={pinnedStore===s.id} onClick={()=>setPinnedStore(pinnedStore===s.id?null:s.id)} color={s.color}>{s.emoji} {s.short}</Chip>
              ))}
              {disabledStores.size>0&&<button onClick={()=>setShowSettings(true)} style={{ whiteSpace:"nowrap",padding:"6px 13px",borderRadius:22,fontSize:11,fontWeight:700,cursor:"pointer",background:"linear-gradient(180deg,rgba(251,191,36,.2) 0%,rgba(180,83,9,.15) 100%)",border:"1px solid rgba(251,191,36,.4)",color:"#fcd34d",flexShrink:0 }}>⚙️ {disabledStores.size} store{disabledStores.size>1?"s":""} hidden</button>}
            </div>

            {/* category pills */}
            <div style={{ display:"flex",gap:5,overflowX:"auto",paddingBottom:9,marginBottom:7 }}>
              {CATS.filter(c=>catCounts[c]).map(cat=>(
                <button key={cat} onClick={()=>setActiveCategory(cat)} style={{ whiteSpace:"nowrap",padding:"5px 13px",borderRadius:20,fontSize:10.5,fontWeight:600,border:"none",cursor:"pointer", background:activeCategory===cat?"linear-gradient(135deg,#16a34a,#15803d)":"rgba(255,255,255,.05)", color:activeCategory===cat?"#fff":"#94a3b8" }}>
                  {cat} <span style={{ opacity:.5,fontSize:8.5 }}>({catCounts[cat]})</span>
                </button>
              ))}
            </div>

            <div style={{ fontSize:10.5,color:"#475569",marginBottom:10 }}>
              {filteredProducts.length} product{filteredProducts.length!==1?"s":""}
              {searchQuery&&` · "${searchQuery}"`}
              {activeCategory!=="All"&&` · ${activeCategory.replace(/^[^\s]+\s/,"")}`}
            </div>

            {/* active store banner */}
            {pinnedStore && (() => {
              const s = STORES.find(x=>x.id===pinnedStore);
              return (
                <div style={{ marginBottom:10, background:`${s.color}18`, border:`1px solid ${s.color}45`, borderRadius:11, padding:"9px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <span style={{ fontSize:18 }}>{s.emoji}</span>
                    <div>
                      <div style={{ fontSize:12, fontWeight:700, color:"#f0f4f8" }}>Showing <span style={{ color:s.color }}>{s.name}</span> prices for all items</div>
                      <div style={{ fontSize:10, color:"#64748b", marginTop:1 }}>Tap any store pill on a card to override that item individually</div>
                    </div>
                  </div>
                  <button onClick={()=>setPinnedStore(null)} style={{ background:"rgba(255,255,255,.1)",border:"none",color:"#94a3b8",borderRadius:7,padding:"4px 9px",cursor:"pointer",fontSize:11,fontWeight:600,whiteSpace:"nowrap" }}>✕ Clear</button>
                </div>
              );
            })()}

            {/* ── JUNE COMPETITION BANNER ── */}
            {COMP_ACTIVE && (
              <div onClick={()=>setShowCompetition(true)} style={{ marginBottom:12,background:"linear-gradient(135deg,#1a0a00 0%,#7c2d12 100%)",border:"1px solid rgba(251,146,60,.4)",borderRadius:12,padding:"11px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",gap:10,boxShadow:"0 4px 16px rgba(194,65,12,.35),inset 0 1px 0 rgba(255,255,255,.08)",position:"relative",overflow:"hidden" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"40%",background:"linear-gradient(180deg,rgba(255,255,255,.07) 0%,rgba(255,255,255,0) 100%)",pointerEvents:"none" }}/>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:22 }}>🏆</span>
                  <div>
                    <div style={{ fontSize:12,fontWeight:700,color:"#fed7aa" }}>June Price Hunt Competition!</div>
                    <div style={{ fontSize:10,color:"#9a3412",marginTop:1 }}>Submit prices · Win a £10 gift voucher · Tap to see leaderboard</div>
                  </div>
                </div>
                <button onClick={e=>{e.stopPropagation();setShowSubmitPrice(true);}} style={{ background:"linear-gradient(180deg,#fb923c 0%,#b45309 100%)",border:"none",borderRadius:9,padding:"8px 13px",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",whiteSpace:"nowrap",flexShrink:0,boxShadow:"0 3px 10px rgba(194,65,12,.6),inset 0 1px 0 rgba(255,255,255,.25)",position:"relative",overflow:"hidden" }}>
                  <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"9px 9px 0 0",pointerEvents:"none" }}/>
                  Submit Price
                </button>
              </div>
            )}

            {sortBy==="cat" ? (() => {
              const stripEmoji = s => s.replace(/^\S+\s/,"");
              const map = new Map();
              filteredProducts.forEach(p => {
                if(!map.has(p.cat)) map.set(p.cat, []);
                map.get(p.cat).push(p);
              });
              const groups = [...map.entries()]
                .sort(([a],[b]) => stripEmoji(a).localeCompare(stripEmoji(b)))
                .map(([cat, items]) => ({ cat, items: items.sort((a,b)=>a.name.localeCompare(b.name)) }));
              return groups.map(({cat,items})=>(
                <div key={cat} style={{ marginBottom:18 }}>
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10,marginTop:4 }}>
                    <div style={{ fontSize:14,fontWeight:700,color:"#f0f4f8",letterSpacing:"-.3px" }}>{cat}</div>
                    <div style={{ flex:1,height:1,background:"rgba(255,255,255,.08)" }}/>
                    <div style={{ fontSize:10,color:"#475569",fontWeight:600 }}>{items.length} item{items.length!==1?"s":""}</div>
                  </div>
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:11 }}>
                    {items.map(p=><ProductCard key={p.id} product={p} onAddToBasket={addToBasket} pinnedStore={pinnedStore} isFavourite={favourites.has(p.id)} onToggleFavourite={toggleFavourite} disabledStores={disabledStores}/>)}
                  </div>
                </div>
              ));
            })() : (
              <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:11 }}>
                {filteredProducts.map(p=><ProductCard key={p.id} product={p} onAddToBasket={addToBasket} pinnedStore={pinnedStore} isFavourite={favourites.has(p.id)} onToggleFavourite={toggleFavourite} disabledStores={disabledStores}/>)}
              </div>
            )}

            {filteredProducts.length===0&&(
              <div style={{ textAlign:"center",padding:"40px 20px",background:"rgba(255,255,255,.03)",borderRadius:18,border:"1px dashed rgba(255,255,255,.07)",marginTop:10 }}>
                <div style={{ fontSize:36,marginBottom:10 }}>🔍</div>
                <div style={{ color:"#f0f4f8",fontSize:14,fontWeight:600,marginBottom:6 }}>
                  No results for {searchQuery ? <span style={{ color:"#22c55e" }}>"{searchQuery}"</span> : "these filters"}
                </div>
                <div style={{ color:"#64748b",fontSize:12,marginBottom:20 }}>
                  Try clearing your search or resetting the filters below.
                </div>
                <div style={{ display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap" }}>
                  {searchQuery&&(
                    <button onClick={()=>setSearchQuery("")} style={{ padding:"8px 18px",background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.35)",borderRadius:9,color:"#22c55e",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                      ✕ Clear "{searchQuery.length>18?searchQuery.slice(0,18)+"…":searchQuery}"
                    </button>
                  )}
                  {(activeCategory!=="All"||pinnedStore)&&(
                    <button onClick={()=>{ setActiveCategory("All"); setPinnedStore(null); }} style={{ padding:"8px 18px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#94a3b8",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                      ↺ Reset filters
                    </button>
                  )}
                  <button onClick={()=>{ setSearchQuery(""); setActiveCategory("All"); setPinnedStore(null); }} style={{ padding:"8px 18px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:9,color:"#94a3b8",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                    Show all products
                  </button>
                  <button onClick={()=>setShowAddModal(true)} style={{ padding:"8px 18px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:9,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600 }}>
                    + Add this item
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═════════════════════════ BASKET ═════════════════════════ */}
        {view==="basket" && (
          <div style={{ marginTop:18 }}>
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14 }}>
              <h2 style={{ fontSize:18,fontWeight:700,margin:0 }}>🧺 Your Basket</h2>
              {basketItems.length>0&&<button onClick={()=>setBasket({})} style={{ background:"linear-gradient(180deg,rgba(239,68,68,.25) 0%,rgba(185,28,28,.2) 100%)",border:"1px solid rgba(239,68,68,.4)",color:"#fca5a5",borderRadius:22,boxShadow:"0 2px 6px rgba(239,68,68,.25),inset 0 1px 0 rgba(255,255,255,.1)",padding:"4px 11px",cursor:"pointer",fontSize:10.5,fontWeight:600 }}>Clear All</button>}
            </div>

            {basketItems.length===0?(
              <div style={{ textAlign:"center",padding:"55px 20px",background:"rgba(255,255,255,.03)",borderRadius:18,border:"1px dashed rgba(255,255,255,.09)" }}>
                <div style={{ fontSize:44,marginBottom:12 }}>🛒</div>
                <div style={{ color:"#64748b" }}>Your basket is empty</div>
                <button onClick={()=>setView("shop")} style={{ marginTop:16,padding:"9px 22px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:600 }}>Start Shopping</button>
              </div>
            ):(
              <div>
                {/* smart tip */}
                <div style={{ background:"linear-gradient(135deg,rgba(34,197,94,.12),rgba(21,128,61,.07))",border:"1px solid rgba(34,197,94,.24)",borderRadius:12,padding:13,marginBottom:14 }}>
                  <div style={{ fontSize:10.5,color:"#86efac",fontWeight:700,marginBottom:3 }}>💡 SMART TIP</div>
                  <div style={{ fontSize:11.5,color:"#d1fae5",lineHeight:1.65 }}>
                    Buying everything from <strong>{storeBasketTotals[0]?.store.name}</strong> costs <strong style={{ color:"#22c55e" }}>£{storeBasketTotals[0]?.total.toFixed(2)}</strong> — saving <strong style={{ color:"#fbbf24" }}>£{(storeBasketTotals[storeBasketTotals.length-1]?.total-storeBasketTotals[0]?.total).toFixed(2)}</strong> vs the most expensive option.
                  </div>
                </div>

                {/* store totals strip */}
                <div style={{ display:"flex",gap:7,overflowX:"auto",paddingBottom:11,marginBottom:13 }}>
                  {storeBasketTotals.map(({store,total},i)=>(
                    <div key={store.id} style={{ flex:"0 0 auto",background:i===0?"rgba(34,197,94,.11)":"rgba(255,255,255,.04)", border:i===0?"1px solid rgba(34,197,94,.28)":"1px solid rgba(255,255,255,.07)", borderRadius:11,padding:"8px 12px",minWidth:95,textAlign:"center" }}>
                      {i===0&&<div style={{ fontSize:7.5,color:"#22c55e",fontWeight:700,marginBottom:2 }}>CHEAPEST</div>}
                      {i===storeBasketTotals.length-1&&<div style={{ fontSize:7.5,color:"#f87171",fontWeight:700,marginBottom:2 }}>PRICIEST</div>}
                      <div style={{ fontSize:15 }}>{store.emoji}</div>
                      <div style={{ fontSize:9.5,fontWeight:600,color:i===0?"#86efac":"#94a3b8",marginTop:2 }}>{store.short}</div>
                      <div style={{ fontSize:15,fontWeight:700,color:i===0?"#22c55e":i===storeBasketTotals.length-1?"#f87171":"#f0f4f8",marginTop:3 }}>£{total.toFixed(2)}</div>
                    </div>
                  ))}
                </div>

                {/* line items */}
                <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
                  {basketItems.map(item=>{
                    const overPay=item.price-getBestPrice(item.product,disabledStores);
                    return(
                      <BasketItem
                        key={item.key}
                        item={item}
                        overPay={overPay}
                        onRemove={()=>removeFromBasket(item.key)}
                        onAdd={()=>addToBasket(item.product.id,item.store?.id)}
                        onDelete={()=>deleteFromBasket(item.key)}
                      />
                    );
                  })}
                </div>

                {/* totals */}
                <div style={{ background:"rgba(255,255,255,.05)",borderRadius:13,padding:15,border:"1px solid rgba(255,255,255,.09)" }}>
                  <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5 }}>
                    <span style={{ fontSize:11,color:"#94a3b8" }}>{basketCount} item{basketCount!==1?"s":""} · {new Set(basketItems.map(i=>i.store?.id)).size} store{new Set(basketItems.map(i=>i.store?.id)).size!==1?"s":""}</span>
                    <span style={{ fontSize:10,color:"#475569" }}>incl. 5% GST</span>
                  </div>
                  <div style={{ display:"flex",justifyContent:"space-between",fontSize:20,fontWeight:700,marginBottom:10 }}>
                    <span>Basket Total</span>
                    <span style={{ color:"#22c55e" }}>£{basketTotal.toFixed(2)}</span>
                  </div>
                  {potentialSave>0.01?(
                    <div style={{ background:"rgba(251,191,36,.09)",border:"1px solid rgba(251,191,36,.22)",borderRadius:9,padding:"8px 12px",fontSize:10.5,color:"#fcd34d" }}>
                      💸 Switch every item to cheapest store → save <strong>£{potentialSave.toFixed(2)}</strong>
                    </div>
                  ):(
                    <div style={{ background:"rgba(34,197,94,.09)",border:"1px solid rgba(34,197,94,.22)",borderRadius:9,padding:"8px 12px",fontSize:10.5,color:"#86efac" }}>
                      ✅ You're already buying every item at its best price!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════ FAVOURITES ══════════════════════ */}
        {view==="favourites" && (()=>{
          const favProducts = allProducts.filter(p=>favourites.has(p.id));
          const favBasketItems = Object.entries(favBasket).map(([key,qty])=>{
            const[pId,sId]=key.split("-");
            const product=allProducts.find(p=>p.id===parseInt(pId));
            if(!product)return null;
            return{key,product,store:STORES.find(s=>s.id===sId),qty,price:product.prices[sId]};
          }).filter(Boolean);
          const favBasketTotal = favBasketItems.reduce((s,i)=>s+i.price*i.qty,0);
          const favOptimal     = favBasketItems.reduce((s,i)=>s+getBestPrice(i.product,disabledStores)*i.qty,0);

          return (
            <div style={{ marginTop:18 }}>
              {/* header */}
              <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
                <h2 style={{ fontSize:18,fontWeight:700,margin:0,display:"flex",alignItems:"center",gap:8 }}>
                  <span style={{ color:"#f43f5e" }}>♥</span> Saved Items
                  <span style={{ fontSize:12,fontWeight:400,color:"#64748b" }}>{favCount} item{favCount!==1?"s":""}</span>
                </h2>
                {favCount>0&&<button onClick={()=>setFavourites(new Set())} style={{ background:"linear-gradient(180deg,rgba(244,63,94,.25) 0%,rgba(190,18,60,.2) 100%)",border:"1px solid rgba(244,63,94,.4)",color:"#fda4af",borderRadius:22,boxShadow:"0 2px 6px rgba(244,63,94,.25),inset 0 1px 0 rgba(255,255,255,.1)",padding:"4px 10px",cursor:"pointer",fontSize:10.5,fontWeight:600 }}>Clear All ♡</button>}
              </div>
              <p style={{ color:"#475569",fontSize:11,marginBottom:18 }}>Items you've hearted. Add them to your favourites basket or your main basket.</p>

              {favCount===0?(
                <div style={{ textAlign:"center",padding:"50px 20px",background:"rgba(255,255,255,.03)",borderRadius:18,border:"1px dashed rgba(244,63,94,.2)",marginTop:10 }}>
                  <div style={{ fontSize:44,marginBottom:12 }}>♡</div>
                  <div style={{ color:"#64748b",fontSize:14,marginBottom:6 }}>No saved items yet</div>
                  <div style={{ color:"#475569",fontSize:12,marginBottom:18 }}>Tap the ♡ heart on any product to save it here</div>
                  <button onClick={()=>setView("shop")} style={{ padding:"9px 22px",background:"linear-gradient(180deg,#fb7185 0%,#be123c 100%)",boxShadow:"0 3px 10px rgba(190,18,60,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:600 }}>Browse Products</button>
                </div>
              ):(
                <div>
                  {/* saved item cards */}
                  <div style={{ display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:11,marginBottom:24 }}>
                    {favProducts.map(p=>(
                      <div key={p.id} style={{ background:"rgba(244,63,94,.04)",border:"1px solid rgba(244,63,94,.18)",borderRadius:16,padding:"12px 14px",position:"relative" }}>
                        {/* remove heart */}
                        <button onClick={()=>toggleFavourite(p.id)} title="Remove from favourites"
                          style={{ position:"absolute",top:10,right:10,background:"none",border:"none",cursor:"pointer",fontSize:16,color:"#f43f5e",lineHeight:1,padding:2 }}
                          onMouseEnter={e=>e.currentTarget.style.transform="scale(1.2)"}
                          onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}
                        >♥</button>

                        {/* product info */}
                        <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:10,paddingRight:26 }}>
                          <span style={{ fontSize:22,flexShrink:0 }}>{p.icon}</span>
                          <div style={{ minWidth:0 }}>
                            <Tooltip text={p.name}>
                              <div style={{ fontSize:12.5,fontWeight:700,color:"#f0f4f8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{p.name}</div>
                            </Tooltip>
                            <div style={{ fontSize:9.5,color:"#475569",marginTop:1 }}>{p.cat.replace(/^[^\s]+\s/,"")}</div>
                          </div>
                        </div>

                        {/* best price row */}
                        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(34,197,94,.08)",border:"1px solid rgba(34,197,94,.15)",borderRadius:8,padding:"6px 10px",marginBottom:9 }}>
                          <div>
                            <div style={{ fontSize:9,color:"#86efac",fontWeight:700 }}>🏆 BEST PRICE</div>
                            <div style={{ fontSize:11,color:"#d1fae5",fontWeight:600 }}>
                              {STORES.find(s=>s.id===getBestStoreId(p,disabledStores))?.emoji} {STORES.find(s=>s.id===getBestStoreId(p,disabledStores))?.name}
                            </div>
                          </div>
                          <div style={{ fontSize:18,fontWeight:800,color:"#22c55e" }}>£{getBestPrice(p).toFixed(2)}</div>
                        </div>

                        {/* action buttons */}
                        <div style={{ display:"flex",gap:7 }}>
                          <button onClick={()=>{ addToFavBasket(p.id,getBestStoreId(p,disabledStores)); showToast(`♥ Added to Favourites Basket`); }}
                            style={{ flex:1,padding:"6px 0",background:"linear-gradient(180deg,#fb7185 0%,#be123c 100%)",boxShadow:"0 3px 10px rgba(190,18,60,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:11,fontWeight:700 }}>
                            ♥ Add to Fav Basket
                          </button>
                          <button onClick={()=>{ addToBasket(p.id,getBestStoreId(p,disabledStores)); showToast(`🧺 Added to Main Basket`); }}
                            style={{ flex:1,padding:"6px 0",background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.3)",borderRadius:8,color:"#22c55e",cursor:"pointer",fontSize:11,fontWeight:700 }}>
                            🧺 Main Basket
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* quick actions */}
                  <div style={{ display:"flex",gap:10,marginBottom:24,flexWrap:"wrap" }}>
                    <button onClick={()=>{ favProducts.forEach(p=>addToFavBasket(p.id,getBestStoreId(p,disabledStores))); showToast(`♥ All ${favCount} items added to Favourites Basket`); }}
                      style={{ padding:"9px 18px",background:"linear-gradient(180deg,#fb7185 0%,#be123c 100%)",boxShadow:"0 3px 10px rgba(190,18,60,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:10,color:"#fff",cursor:"pointer",fontSize:12,fontWeight:700 }}>
                      ♥ Add All to Fav Basket
                    </button>
                    <button onClick={()=>{ favProducts.forEach(p=>addToBasket(p.id,getBestStoreId(p,disabledStores))); showToast(`🧺 All ${favCount} items added to Main Basket`); }}
                      style={{ padding:"9px 18px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",border:"none",borderRadius:10,color:"#052e16",cursor:"pointer",fontSize:12,fontWeight:700,boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",position:"relative",overflow:"hidden" }}>
                      🧺 Add All to Main Basket
                    </button>
                  </div>

                  {/* favourites basket */}
                  {favBasketCount>0&&(
                    <div>
                      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12 }}>
                        <h3 style={{ fontSize:15,fontWeight:700,margin:0,color:"#f43f5e" }}>♥ Favourites Basket</h3>
                        <button onClick={()=>setFavBasket({})} style={{ background:"linear-gradient(180deg,rgba(244,63,94,.25) 0%,rgba(190,18,60,.2) 100%)",border:"1px solid rgba(244,63,94,.4)",color:"#fda4af",borderRadius:22,boxShadow:"0 2px 6px rgba(244,63,94,.25),inset 0 1px 0 rgba(255,255,255,.1)",padding:"3px 9px",cursor:"pointer",fontSize:10,fontWeight:600 }}>Clear</button>
                      </div>
                      <div style={{ display:"flex",flexDirection:"column",gap:6,marginBottom:14 }}>
                        {favBasketItems.map(item=>{
                          const overPay=item.price-getBestPrice(item.product,disabledStores);
                          return(
                            <div key={item.key} style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:"rgba(244,63,94,.05)",borderRadius:12,padding:"9px 13px",border:"1px solid rgba(244,63,94,.15)",transition:"all .2s" }}>
                              <div style={{ display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0 }}>
                                <span style={{ fontSize:18,flexShrink:0 }}>{item.product.icon}</span>
                                <div style={{ minWidth:0 }}>
                                  <Tooltip text={item.product.name}>
                                    <div style={{ fontSize:11.5,fontWeight:600,color:"#f0f4f8",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{item.product.name}</div>
                                  </Tooltip>
                                  <div style={{ fontSize:9.5,color:"#475569" }}>{item.store?.emoji} {item.store?.name} · £{item.price.toFixed(2)}{overPay>0.01&&<span style={{ color:"#f87171",marginLeft:3 }}>(+£{overPay.toFixed(2)})</span>}</div>
                                </div>
                              </div>
                              <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                                <div style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,.06)",borderRadius:8,padding:"3px 7px" }}>
                                  <button onClick={()=>removeFromFavBasket(item.key)} style={{ background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:13,fontWeight:700,lineHeight:1 }}>−</button>
                                  <span style={{ fontSize:11,fontWeight:700,minWidth:13,textAlign:"center" }}>{item.qty}</span>
                                  <button onClick={()=>addToFavBasket(item.product.id,item.store?.id)} style={{ background:"none",border:"none",color:"#f43f5e",cursor:"pointer",fontSize:13,fontWeight:700,lineHeight:1 }}>+</button>
                                </div>
                                <span style={{ fontSize:12.5,fontWeight:700,color:"#f0f4f8",minWidth:46,textAlign:"right" }}>£{(item.price*item.qty).toFixed(2)}</span>
                                <button onClick={()=>deleteFromFavBasket(item.key)}
                                  title="Remove item"
                                  style={{ background:"rgba(239,68,68,.12)",border:"1px solid rgba(239,68,68,.25)",borderRadius:6,width:22,height:22,color:"#ef4444",cursor:"pointer",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}
                                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(239,68,68,.3)";}}
                                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(239,68,68,.12)";}}>✕</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* fav basket total */}
                      <div style={{ background:"rgba(244,63,94,.07)",borderRadius:13,padding:14,border:"1px solid rgba(244,63,94,.2)",marginBottom:12 }}>
                        <div style={{ display:"flex",justifyContent:"space-between",fontSize:16,fontWeight:700 }}>
                          <span style={{ color:"#f0f4f8" }}>Favourites Total</span>
                          <span style={{ color:"#f43f5e" }}>£{favBasketTotal.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize:10,color:"#64748b",marginTop:4 }}>{favBasketCount} item{favBasketCount!==1?"s":""} · incl. 5% GST</div>
                        {favBasketTotal-favOptimal>0.01&&(
                          <div style={{ marginTop:8,fontSize:10.5,color:"#fcd34d",background:"rgba(251,191,36,.08)",borderRadius:7,padding:"5px 10px" }}>
                            💸 Switch all to cheapest store → save £{(favBasketTotal-favOptimal).toFixed(2)}
                          </div>
                        )}
                      </div>

                      {/* move to main basket */}
                      <button onClick={()=>{
                        favBasketItems.forEach(item=>addToBasket(item.product.id,item.store?.id));
                        setFavBasket({});
                        setView("basket");
                        showToast("🧺 Favourites basket moved to main basket!");
                      }} style={{ width:"100%",padding:"11px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                        🧺 Move Everything to Main Basket
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })()}

        {/* ═══════════════════════ COMPARE ══════════════════════════ */}
        {view==="compare" && (
          <div style={{ marginTop:18 }}>
            <h2 style={{ fontSize:18,fontWeight:700,marginBottom:3 }}>📊 Store Comparison</h2>
            <p style={{ color:"#64748b",fontSize:11,marginBottom:16 }}>Jersey Channel Islands · Prices include 5% GST · Updated May 2026</p>
            <div style={{ display:"grid",gap:10 }}>
              {STORES.map(store=>{
                const items=allProducts.filter(p=>p.prices[store.id]);
                const avg=items.reduce((s,p)=>s+p.prices[store.id],0)/items.length;
                const wins=items.filter(p=>getBestStoreId(p)===store.id).length;
                const winPct=Math.round((wins/items.length)*100);
                const sc = store.color;
                const r=parseInt(sc.slice(1,3),16), g=parseInt(sc.slice(3,5),16), b=parseInt(sc.slice(5,7),16);
                return(
                  <div key={store.id} style={{
                    background:`linear-gradient(135deg,rgba(${r},${g},${b},0.12) 0%,rgba(${r},${g},${b},0.04) 100%)`,
                    border:`1px solid rgba(${r},${g},${b},0.35)`,
                    borderLeft:`4px solid ${sc}`,
                    borderRadius:14, padding:16,
                    boxShadow:`0 4px 16px rgba(${r},${g},${b},0.15), inset 0 1px 0 rgba(255,255,255,0.07)`,
                    position:"relative", overflow:"hidden",
                  }}>
                    <span style={{ position:"absolute",top:0,left:0,right:0,height:"40%",background:"linear-gradient(180deg,rgba(255,255,255,.05) 0%,rgba(255,255,255,0) 100%)",pointerEvents:"none" }}/>
                    <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:10 }}>
                      <div>
                        <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3 }}>
                          <span style={{ fontSize:19 }}>{store.emoji}</span>
                          <span style={{ fontSize:15,fontWeight:700 }}>{store.name}</span>
                          <span style={{
                            background:`linear-gradient(180deg,rgba(${r},${g},${b},0.4) 0%,rgba(${r},${g},${b},0.2) 100%)`,
                            color:sc, border:`1px solid rgba(${r},${g},${b},0.5)`,
                            borderRadius:22, padding:"2px 9px", fontSize:8.5, fontWeight:700,
                            boxShadow:`0 1px 4px rgba(${r},${g},${b},0.3)`,
                          }}>{store.tag}</span>
                        </div>
                        <div style={{ fontSize:10,color:"#64748b" }}>📍 {store.note}</div>
                      </div>
                      <div style={{ textAlign:"right" }}>
                        <div style={{ fontSize:19,fontWeight:700,color:sc,textShadow:`0 0 10px rgba(${r},${g},${b},0.5)` }}>£{avg.toFixed(2)}</div>
                        <div style={{ fontSize:9,color:"#64748b" }}>avg / item</div>
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:9,marginTop:11,flexWrap:"wrap" }}>
                      <div style={{ background:`linear-gradient(180deg,rgba(${r},${g},${b},0.15) 0%,rgba(${r},${g},${b},0.08) 100%)`,border:`1px solid rgba(${r},${g},${b},0.25)`,borderRadius:10,padding:"7px 14px",textAlign:"center",boxShadow:"inset 0 1px 0 rgba(255,255,255,.07)" }}>
                        <div style={{ fontSize:16,fontWeight:700,color:sc,textShadow:`0 0 8px rgba(${r},${g},${b},0.4)` }}>{wins}</div>
                        <div style={{ fontSize:7.5,color:"#94a3b8" }}>cheapest items</div>
                      </div>
                      <div style={{ background:`linear-gradient(180deg,rgba(${r},${g},${b},0.15) 0%,rgba(${r},${g},${b},0.08) 100%)`,border:`1px solid rgba(${r},${g},${b},0.25)`,borderRadius:10,padding:"7px 14px",textAlign:"center",boxShadow:"inset 0 1px 0 rgba(255,255,255,.07)" }}>
                        <div style={{ fontSize:16,fontWeight:700,color:sc,textShadow:`0 0 8px rgba(${r},${g},${b},0.4)` }}>{winPct}%</div>
                        <div style={{ fontSize:7.5,color:"#94a3b8" }}>of range</div>
                      </div>
                      <div style={{ background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:10,padding:"7px 12px",flex:1,fontSize:10,color:"#94a3b8",lineHeight:1.5 }}>
                        {store.id==="coop"&&"✅ Best overall value. Family-friendly. Large stores closed Sunday."}
                        {store.id==="morrisons"&&"⚠️ Prices ~45% above UK Morrisons. Convenience format across multiple branches."}
                        {store.id==="ms"&&"✨ Premium quality. Freight surcharge applied. Best for special occasions."}
                        {store.id==="waitrose"&&"🌱 Excellent organic & ethical range. Great health-conscious choice."}
                        {store.id==="iceland"&&"🧊 Best for frozen & freezer staples. Run by Alliance since March 2025. Two Jersey stores."}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop:16,background:"rgba(234,179,8,.06)",border:"1px solid rgba(234,179,8,.17)",borderRadius:12,padding:15 }}>
              <div style={{ fontSize:11,color:"#fbbf24",fontWeight:700,marginBottom:6 }}>ℹ️ Jersey Pricing Context</div>
              <div style={{ fontSize:10.5,color:"#94a3b8",lineHeight:1.85 }}>
                Groceries in Jersey average <strong style={{ color:"#fbbf24" }}>14–19% more</strong> than UK mainland prices due to freight costs, the small market size, and higher labour costs. Without Aldi or Lidl, low-income households can pay up to <strong style={{ color:"#fbbf24" }}>49% more</strong> than their UK counterparts. The CI Co-op (Grande Marché) consistently offers the best everyday value for Jersey residents.
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ══ ADD ITEM MODAL ══ */}
      {showAddModal&&(
        <div style={{ position:"fixed",inset:0,zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.72)",backdropFilter:"blur(8px)" }}
          onClick={e=>{if(e.target===e.currentTarget){setShowAddModal(false);setAddError("");}}}>
          <div style={{ width:"100%",maxWidth:580,background:"#0a1a30",border:"1px solid rgba(255,255,255,.11)",borderRadius:"20px 20px 0 0",padding:"21px 20px 28px",maxHeight:"82vh",overflowY:"auto",paddingBottom:"calc(10vh + 32px)" }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15,position:"sticky",top:0,background:"#0a1a30",paddingTop:4,paddingBottom:8,zIndex:10 }}>
              <div>
                <div style={{ fontSize:16,fontWeight:700 }}>➕ Add Custom Item</div>
                <div style={{ fontSize:10.5,color:"#64748b",marginTop:2 }}>Enter prices for the stores you know — leave others blank</div>
              </div>
              <button onClick={()=>{setShowAddModal(false);setAddError("");}} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:27,height:27,color:"#94a3b8",cursor:"pointer",fontSize:13 }}>✕</button>
            </div>

            <div style={{ display:"flex",gap:10,marginBottom:12 }}>
              <div style={{ position:"relative",flexShrink:0 }}>
                <button onClick={()=>setIconPickerOpen(!iconPickerOpen)} style={{ width:44,height:44,background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.12)",borderRadius:10,fontSize:20,cursor:"pointer" }}>{newItem.icon}</button>
                {iconPickerOpen&&(
                  <div style={{ position:"absolute",top:50,left:0,zIndex:50,background:"#0a1a30",border:"1px solid rgba(255,255,255,.14)",borderRadius:12,padding:8,display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:3,width:235,boxShadow:"0 8px 32px rgba(0,0,0,.7)" }}>
                    {ICON_OPTIONS.map(ic=>(
                      <button key={ic} onClick={()=>{setNewItem(p=>({...p,icon:ic}));setIconPickerOpen(false);}} style={{ background:newItem.icon===ic?"rgba(34,197,94,.18)":"transparent",border:"none",borderRadius:5,fontSize:16,cursor:"pointer",padding:3,lineHeight:1 }}>{ic}</button>
                    ))}
                  </div>
                )}
              </div>
              <input value={newItem.name} onChange={e=>setNewItem(p=>({...p,name:e.target.value}))} placeholder="Product name, e.g. Oat Milk 1L"
                style={{ flex:1,padding:"0 13px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:10,color:"#fff",fontSize:12.5,outline:"none",height:44 }} />
            </div>

            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:9.5,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>CATEGORY</div>
              <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                {CATS.filter(c=>c!=="All").map(cat=>(
                  <button key={cat} onClick={()=>setNewItem(p=>({...p,cat}))} style={{ padding:"4px 10px",borderRadius:14,fontSize:9.5,fontWeight:600,cursor:"pointer",border:"none",background:newItem.cat===cat?"linear-gradient(135deg,#16a34a,#15803d)":"rgba(255,255,255,.06)",color:newItem.cat===cat?"#fff":"#94a3b8" }}>{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom:13 }}>
              <div style={{ fontSize:9.5,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:7 }}>STORE PRICES (£) — leave blank if unknown</div>
              <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:7 }}>
                {STORES.map(store=>{
                  const val=parseFloat(newItem.prices[store.id]);
                  const isBest=!isNaN(val)&&val>0&&val===liveMin;
                  return(
                    <div key={store.id} style={{ display:"flex",alignItems:"center",gap:7,background:isBest?"rgba(34,197,94,.1)":"rgba(255,255,255,.04)",border:isBest?"1px solid rgba(34,197,94,.28)":"1px solid rgba(255,255,255,.07)",borderRadius:9,padding:"7px 10px",transition:"all .15s" }}>
                      <span style={{ fontSize:14 }}>{store.emoji}</span>
                      <div style={{ flex:1,minWidth:0 }}>
                        <div style={{ fontSize:9,color:isBest?"#86efac":"#64748b",marginBottom:2,fontWeight:isBest?700:400 }}>{store.name}{isBest?" 🏆":""}</div>
                        <div style={{ display:"flex",alignItems:"center",gap:3 }}>
                          <span style={{ fontSize:11,color:"#64748b" }}>£</span>
                          <input type="number" step="0.01" min="0" placeholder="—" value={newItem.prices[store.id]}
                            onChange={e=>setNewItem(p=>({...p,prices:{...p.prices,[store.id]:e.target.value}}))}
                            style={{ width:"100%",background:"transparent",border:"none",borderBottom:"1px solid rgba(255,255,255,.13)",color:"#fff",fontSize:12.5,fontWeight:600,outline:"none",padding:"1px 0" }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {liveVals.length>0&&(
              <div style={{ background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.18)",borderRadius:9,padding:10,marginBottom:11 }}>
                <div style={{ fontSize:9.5,color:"#86efac",fontWeight:700,marginBottom:5 }}>📊 LIVE PREVIEW</div>
                <div style={{ display:"flex",flexWrap:"wrap",gap:5 }}>
                  {STORES.filter(s=>newItem.prices[s.id]!=="").map(store=>{
                    const val=parseFloat(newItem.prices[store.id]);
                    const isBest=!isNaN(val)&&val===liveMin;
                    return(
                      <div key={store.id} style={{ display:"flex",alignItems:"center",gap:4,background:isBest?"rgba(34,197,94,.15)":"rgba(255,255,255,.05)",borderRadius:7,padding:"3px 9px",border:isBest?"1px solid rgba(34,197,94,.3)":"none" }}>
                        <span style={{ fontSize:11 }}>{store.emoji}</span>
                        <span style={{ fontSize:10.5,color:isBest?"#22c55e":"#94a3b8",fontWeight:isBest?700:400 }}>{!isNaN(val)?`£${val.toFixed(2)}`:"–"}{isBest?" ✓":""}</span>
                      </div>
                    );
                  })}
                  {liveVals.length>1&&liveMin!=null&&(
                    <div style={{ fontSize:9.5,color:"#64748b",alignSelf:"center",marginLeft:4 }}>
                      saving £{(Math.max(...liveVals)-liveMin).toFixed(2)} vs most expensive
                    </div>
                  )}
                </div>
              </div>
            )}

            {addItemStatus==="sent" ? (
              <div style={{ textAlign:"center",padding:"20px 0" }}>
                <div style={{ fontSize:40,marginBottom:12 }}>🎉</div>
                <div style={{ fontSize:15,fontWeight:700,color:"#22c55e",marginBottom:8 }}>Submission Received!</div>
                <div style={{ fontSize:12,color:"#94a3b8",lineHeight:1.7,marginBottom:20 }}>
                  Thank you! Your product suggestion has been sent for review.<br/>
                  Once verified in-store it will be added to the app shortly.
                </div>
                <button onClick={()=>{ setAddItemStatus("idle"); setShowAddModal(false); setNewItem({name:"",cat:"➕ Custom",icon:"🛒",prices:{coop:"",morrisons:"",ms:"",waitrose:"",iceland:""}}); }}
                  style={{ padding:"10px 28px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
                  Back to App
                </button>
              </div>
            ) : (
              <>
                <div style={{ background:"rgba(251,191,36,.08)",border:"1px solid rgba(251,191,36,.2)",borderRadius:9,padding:"8px 12px",marginBottom:12,fontSize:11,color:"#fcd34d",lineHeight:1.6 }}>
                  ℹ️ Your suggestion will be reviewed before going live. Once verified in-store it will be added for everyone.
                </div>
                {addError&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",borderRadius:8,padding:"7px 12px",fontSize:10.5,color:"#fca5a5",marginBottom:11 }}>{addError}</div>}
                {addItemStatus==="error"&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",borderRadius:8,padding:"7px 12px",fontSize:10.5,color:"#fca5a5",marginBottom:11 }}>Something went wrong. Please try again or email hello@jerseybasket.je</div>}
                <button onClick={submitNewItem} disabled={addItemStatus==="sending"}
                  style={{ width:"100%",padding:"12px",background:addItemStatus==="sending"?"rgba(34,197,94,.4)":"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",cursor:addItemStatus==="sending"?"wait":"pointer",fontSize:14,fontWeight:700 }}>
                  {addItemStatus==="sending" ? "Sending…" : "📤 Submit for Review"}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TOAST ── */}
      {toast&&(
        <div style={{ position:"fixed",bottom:"calc(10vh + 10px)",left:"50%",transform:"translateX(-50%)",zIndex:300,
          background:"#16a34a",color:"#fff",borderRadius:12,padding:"11px 20px",fontSize:13,fontWeight:600,
          boxShadow:"0 4px 24px rgba(0,0,0,.5)",whiteSpace:"nowrap",pointerEvents:"none" }}>
          {toast}
        </div>
      )}

      {/* ── AD BANNER ── */}
      {/* ── FOOTER ── */}
      <div style={{ position:"fixed",bottom:"calc(10vh + 1px)",left:0,right:0,background:"rgba(5,13,26,.97)",backdropFilter:"blur(16px)",borderTop:"1px solid rgba(255,255,255,.09)",padding:"6px 20px",display:"flex",justifyContent:"center",alignItems:"center",fontSize:10,color:"#475569",gap:12,zIndex:199,flexWrap:"wrap",minHeight:28 }}>
        <span>🇯🇪 Jersey, Channel Islands</span>
        <span style={{ color:"#1e293b" }}>·</span>
        <span>© 2026 Eamonn O'Shea</span>
        <span style={{ color:"#1e293b" }}>·</span>
        <a href="mailto:hello@jerseybasket.je" style={{ color:"#22c55e",textDecoration:"none",fontWeight:600 }}>hello@jerseybasket.je</a>
        <span style={{ color:"#1e293b" }}>·</span>
        <span style={{ color:"#22c55e",fontWeight:600 }}>
          🕐 Prices updated: {new Date().toLocaleDateString("en-GB", { day:"numeric", month:"long", year:"numeric" })}
        </span>
        <span style={{ color:"#1e293b" }}>·</span>
        <span>Always verify in-store</span>
      </div>

      {/* ── WELCOME SCREEN — first visit only ── */}
      {showWelcome && <WelcomeModal onDismiss={dismissWelcome} onSubmitPrice={()=>setShowSubmitPrice(true)} />}

      {/* ── REPORT MODAL ── */}
      {showReport && <ReportModal onClose={()=>setShowReport(false)} />}

      {/* ── ENQUIRY MODAL ── */}
      {showEnquiry && <EnquiryModal onClose={()=>setShowEnquiry(false)} />}

      {/* ── HELP MODAL ── */}
      {showHelp && <HelpModal onClose={()=>setShowHelp(false)} onShare={()=>{
        const shareData = { title:"JerseyBasket.je", text:"Compare grocery prices across all Jersey supermarkets! 🇯🇪", url:"https://jerseybasket.je" };
        if (navigator.share) { navigator.share(shareData).catch(()=>{}); }
        else { navigator.clipboard.writeText("https://jerseybasket.je").then(()=>showToast("🔗 Link copied!")); }
      }} onReplay={()=>{
        setShowHelp(false);
        setShowWelcome(true);
      }} />}

      {/* ── SETTINGS MODAL ── */}
      {showSettings && <SettingsModal disabledStores={disabledStores} onToggleStore={toggleStore} onClose={()=>setShowSettings(false)} />}

      {/* ── COMPETITION MODAL ── */}
      {showCompetition && <CompetitionModal onClose={()=>setShowCompetition(false)} onSubmit={()=>{setShowCompetition(false);setShowSubmitPrice(true);}} />}

      {/* ── SUBMIT PRICE MODAL ── */}
      {showSubmitPrice && <SubmitPriceModal onClose={()=>setShowSubmitPrice(false)} />}

      <AdBanner onEnquiry={()=>setShowEnquiry(true)} />

    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   AD BANNER COMPONENT — 4 slides, scrolls every 2s, fixed bottom ~20vh
═══════════════════════════════════════════════════════════════════════════ */
const ENQUIRY_TRIGGER = "enquiry";

const AD_SLIDES = [
  {
    id: 0,
    link: ENQUIRY_TRIGGER,
    bg:       "linear-gradient(135deg,#052e16 0%,#14532d 45%,#16a34a 100%)",
    eyebrow:  { text:"ADVERTISING",        color:"#4ade80" },
    headline: { before:"This could be ",   highlight:"your",  highlightColor:"#4ade80", after:" Business" },
    sub:      { text:"Reach every Jersey shopper — every day", color:"#86efac" },
    cta:      { label:"Advertise here",    labelColor:"#4ade80", url:"jerseybasket.je", urlColor:"#f0fdf4", arrowBg:"#4ade80",   arrowColor:"#052e16", boxBg:"rgba(74,222,128,0.15)", boxBorder:"#4ade80" },
    stats:    [{ val:"730+", label:"weekly users" },{ val:"428",    label:"products" }],
    statColor:"#4ade80",
    accent:   "linear-gradient(90deg,transparent,#22c55e55,transparent)",
    deco: true,
  },
  {
    id: 1,
    link: ENQUIRY_TRIGGER,
    bg:       "#050d1a",
    eyebrow:  { text:"PARTNER WITH US",    color:"#f59e0b" },
    headline: { before:"This could be ",   highlight:"your",  highlightColor:"#f59e0b", after:" Business", highlightGold:true },
    sub:      { text:"Jersey's #1 price comparison platform", color:"#94a3b8" },
    cta:      { label:"Get featured",      labelColor:"#f59e0b", url:"jerseybasket.je", urlColor:"#f0f4f8", arrowBg:"#f59e0b",   arrowColor:"#050d1a", boxBg:"rgba(245,158,11,0.1)", boxBorder:"rgba(245,158,11,0.5)" },
    stats:    [{ val:"5",      label:"stores compared" },{ val:"Daily",  label:"active users" }],
    statColor:"#f59e0b",
    accent:   "linear-gradient(90deg,transparent,#f59e0b,#fbbf24,#f59e0b,transparent)",
    grid: true,
  },
  {
    id: 2,
    link: ENQUIRY_TRIGGER,
    bg:       "linear-gradient(135deg,#7f1d1d 0%,#991b1b 50%,#b91c1c 100%)",
    eyebrow:  { text:"🇯🇪 JERSEY LOCAL",   color:"#fca5a5" },
    headline: { before:"This could be ",   highlight:"your",  highlightColor:"#fca5a5", highlightUnderline:true, after:" Business", headlineColor:"#fff" },
    sub:      { text:"Built for Jersey. Used by Jersey.", color:"rgba(255,255,255,0.7)" },
    cta:      { label:"Book a spot",       labelColor:"#fca5a5", url:"jerseybasket.je", urlColor:"white",   arrowBg:"white",       arrowColor:"#b91c1c", boxBg:"rgba(255,255,255,0.12)", boxBorder:"rgba(255,255,255,0.35)" },
    stats:    [{ val:"Local",  label:"audience only" },{ val:"Zero",   label:"wasted reach" }],
    statColor:"#fca5a5",
    cross: true,
  },
  {
    id: 3,
    link: ENQUIRY_TRIGGER,
    bg:       "#f8fafc",
    eyebrow:  { text:"YOUR BRAND HERE",    color:"#16a34a" },
    headline: { before:"This could be ",   highlight:"your",  highlightColor:"#22c55e", highlightGreen:true, after:" Business", headlineColor:"#0f172a" },
    sub:      { text:"Sponsor Jersey's trusted grocery comparison app", color:"#64748b" },
    cta:      { label:"Enquire today",     labelColor:"#15803d", url:"jerseybasket.je", urlColor:"#0f172a", arrowBg:"linear-gradient(135deg,#16a34a,#15803d)", arrowColor:"white", boxBg:"linear-gradient(135deg,#f0fdf4,#dcfce7)", boxBorder:"#16a34a" },
    stats:    [{ val:"Targeted", label:"Jersey shoppers" },{ val:"Affordable", label:"rates" }],
    statColor:"#16a34a",
    light: true,
    accentBottom: "linear-gradient(90deg,#16a34a,#22c55e,#16a34a)",
  },
  {
    id: 4,
    link: ENQUIRY_TRIGGER,
    bg:       "linear-gradient(135deg,#0c1445 0%,#1e3a8a 60%,#1d4ed8 100%)",
    eyebrow:  { text:"SLOT AVAILABLE",     color:"#93c5fd" },
    headline: { before:"Your Business. ",  highlight:"Here.", highlightColor:"#93c5fd", after:" Jersey's shoppers.", headlineColor:"#f0f4f8" },
    sub:      { text:"Limited banner slots — enquire now", color:"#bfdbfe" },
    cta:      { label:"Reserve this slot", labelColor:"#93c5fd", url:"jerseybasket.je", urlColor:"#f0f4f8", arrowBg:"#3b82f6", arrowColor:"white", boxBg:"rgba(59,130,246,0.15)", boxBorder:"rgba(147,197,253,0.4)" },
    stats:    [{ val:"Only 4", label:"slots total" },{ val:"From £99", label:"per month" }],
    statColor:"#93c5fd",
    accent:   "linear-gradient(90deg,transparent,#3b82f688,transparent)",
  },
];

/* ═══════════════════════════════════════════════════════════════════════════
   INSTALL STEPS — reusable install instructions component
═══════════════════════════════════════════════════════════════════════════ */
function InstallSteps({ accent = "#22c55e", compact = false }) {
  const ua = navigator.userAgent.toLowerCase();
  const isIos       = /iphone|ipad|ipod/i.test(ua);
  const isAndroid   = /android/i.test(ua);
  const isSafari    = /safari/i.test(ua) && !/chrome|crios|fxios/i.test(ua);
  const isChrome    = /chrome|crios/i.test(ua);
  const isInAppBrowser = /fbav|fban|instagram|twitter|line|wechat/i.test(ua);

  const [tab, setTab] = useState(isAndroid ? "android" : "iphone");

  // Wrong browser warnings
  const wrongBrowserWarning = () => {
    if (isInAppBrowser) {
      return {
        show: true,
        icon: "⚠️",
        color: "#f59e0b",
        text: "You're in an in-app browser. Tap the ··· menu and select \"Open in Safari\" (iPhone) or \"Open in Chrome\" (Android) first.",
      };
    }
    if (tab === "iphone" && isIos && !isSafari) {
      return {
        show: true,
        icon: "⚠️",
        color: "#f59e0b",
        text: "You need to open this page in Safari to install it. Copy the link below and paste it into Safari:",
      };
    }
    return { show: false };
  };

  const warning = wrongBrowserWarning();

  const iphoneSteps = [
    { icon:"🧭", text: isSafari || !isIos ? "Open jerseybasket.je in Safari" : "You're already in Safari ✓", done: isSafari },
    { icon:"⬆️", text:"Tap the Share button at the bottom of Safari" },
    { icon:"➕", text:"Scroll down and tap \"Add to Home Screen\"" },
    { icon:"✅", text:"Tap \"Add\" top right — the app icon appears on your home screen!" },
  ];

  const androidSteps = [
    { icon:"🌐", text: isChrome || !isAndroid ? "Open jerseybasket.je in Chrome" : "You're already in Chrome ✓", done: isChrome },
    { icon:"⋮",  text:"Tap the three dots ⋮ menu in the top right corner" },
    { icon:"➕", text:"Tap \"Add to Home Screen\"" },
    { icon:"✅", text:"Tap \"Add\" — the app icon appears on your home screen!" },
  ];

  const steps = tab === "iphone" ? iphoneSteps : androidSteps;

  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://jerseybasket.je")
      .then(()=>alert("✅ Link copied! Now open Safari and paste it in the address bar."))
      .catch(()=>alert("Visit: https://jerseybasket.je"));
  };

  return (
    <div style={{ width:"100%", marginTop:16 }}>
      {/* tab switcher */}
      <div style={{ display:"flex", background:"rgba(0,0,0,.3)", borderRadius:10, padding:3, marginBottom:12, gap:3 }}>
        {[["iphone","🍎 iPhone / iPad"],["android","🤖 Android"]].map(([id,lbl])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ flex:1, padding:compact?"5px 0":"7px 0", borderRadius:8, border:"none", cursor:"pointer", fontSize:compact?10:11, fontWeight:700,
            background: tab===id ? accent : "transparent",
            color: tab===id ? (accent==="#22c55e"?"#052e16":"#0a1628") : "rgba(255,255,255,.5)",
            transition:"all .2s" }}>
            {lbl}
          </button>
        ))}
      </div>

      {/* wrong browser warning */}
      {warning.show && (
        <div style={{ background:"rgba(245,158,11,.12)", border:"1px solid rgba(245,158,11,.35)", borderRadius:10, padding:"10px 12px", marginBottom:12, display:"flex", flexDirection:"column", gap:8 }}>
          <div style={{ fontSize:compact?10.5:12, color:"#fcd34d", lineHeight:1.5 }}>
            <span style={{ marginRight:6 }}>{warning.icon}</span>{warning.text}
          </div>
          {tab==="iphone" && isIos && !isSafari && (
            <button onClick={handleCopyLink} style={{ padding:"7px 12px", background:"rgba(245,158,11,.2)", border:"1px solid rgba(245,158,11,.4)", borderRadius:8, color:"#fcd34d", cursor:"pointer", fontSize:11, fontWeight:700 }}>
              📋 Copy jerseybasket.je link
            </button>
          )}
        </div>
      )}

      {/* steps */}
      <div style={{ display:"flex", flexDirection:"column", gap:compact?5:7 }}>
        {steps.map((step, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:10,
            background: step.done ? "rgba(34,197,94,.12)" : "rgba(255,255,255,.06)",
            border: step.done ? "1px solid rgba(34,197,94,.25)" : "1px solid rgba(255,255,255,.06)",
            borderRadius:9, padding:compact?"7px 10px":"9px 12px" }}>
            <div style={{ width:compact?26:30, height:compact?26:30, borderRadius:7,
              background: step.done ? "rgba(34,197,94,.25)" : `${accent}22`,
              border:`1px solid ${step.done?"rgba(34,197,94,.4)":accent+"44"}`,
              display:"flex", alignItems:"center", justifyContent:"center",
              fontSize:compact?13:15, flexShrink:0 }}>
              {step.done ? "✓" : step.icon}
            </div>
            <div style={{ fontSize:compact?10.5:12, color: step.done?"#86efac":"rgba(255,255,255,.85)", fontWeight:step.done?600:500, lineHeight:1.4 }}>
              <span style={{ color: step.done?"#22c55e":accent, fontWeight:700, marginRight:5 }}>{i+1}.</span>
              {step.text}
            </div>
          </div>
        ))}
      </div>

      {/* direct link button */}
      {!compact && (
        <a href="https://jerseybasket.je" target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:12,
            padding:"10px", background:"rgba(34,197,94,.12)", border:"1px solid rgba(34,197,94,.28)",
            borderRadius:10, color:"#22c55e", textDecoration:"none", fontSize:12, fontWeight:700 }}>
          🔗 jerseybasket.je — tap to open in browser
        </a>
      )}

      {!compact && (
        <div style={{ marginTop:10, fontSize:10, color:"rgba(255,255,255,.35)", textAlign:"center" }}>
          No App Store needed · Works offline · Always free
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   WELCOME SCREEN — shown once to first-time visitors
═══════════════════════════════════════════════════════════════════════════ */
function WelcomeModal({ onDismiss, onSubmitPrice }) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      emoji: "🛍️",
      title: "Welcome to JerseyBasket.je",
      subtitle: "Join 730+ Jersey shoppers saving money every week",
      body: "Compare prices across all 5 Jersey supermarkets instantly. Find the cheapest price on every item — and build your shopping list before you leave the house.",
      bg: "linear-gradient(135deg,#052e16 0%,#14532d 50%,#16a34a 100%)",
      accent: "#22c55e",
    },
    {
      emoji: "🏆",
      title: "Always the Cheapest Price First",
      subtitle: "428+ products across 5 stores",
      body: "Every product shows you the lowest price available in Jersey right now. Tap the store pill to compare all stores — or pin one store to see all their prices at once.",
      bg: "linear-gradient(135deg,#0c1445 0%,#1e3a8a 100%)",
      accent: "#93c5fd",
    },
    {
      emoji: "🧺",
      title: "Build Your Shopping List",
      subtitle: "Smart basket with savings calculator",
      body: "Add items as you browse. The basket automatically works out which single store is cheapest for your whole shop — and shows exactly how much you'd save.",
      bg: "linear-gradient(135deg,#1a0533 0%,#581c87 100%)",
      accent: "#c4b5fd",
    },
    {
      emoji: "♥",
      title: "Save Your Favourites",
      subtitle: "Heart items to save them for next time",
      body: "Tap the heart on any product to save it. Your favourites have their own basket — add them all in one tap every week. Your regular shop, sorted in seconds.",
      bg: "linear-gradient(135deg,#450a0a 0%,#991b1b 100%)",
      accent: "#fca5a5",
    },
    {
      emoji: "📱",
      title: "Install it on Your Phone",
      subtitle: "Works like a native app — completely free",
      body: "Add JerseyBasket to your home screen in seconds:",
      bg: "linear-gradient(135deg,#0a1628 0%,#0d1f38 100%)",
      accent: "#22c55e",
      installSteps: true,
    },
    {
      emoji: "🏆",
      title: "June Price Hunt!",
      subtitle: "Win a £10 gift voucher",
      body: "Help us verify prices across Jersey's 5 supermarkets — and win! Submit prices from your shopping receipts throughout June. The shopper who submits the most verified prices wins a £10 gift voucher. 🇯🇪",
      bg: "linear-gradient(135deg,#1a0a00 0%,#7c2d12 60%,#c2410c 100%)",
      accent: "#fb923c",
      competition: true,
    },
  ];

  const s = steps[step];
  const isLast = step === steps.length - 1;

  return (
    <div style={{ position:"fixed",inset:0,zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.85)",backdropFilter:"blur(10px)",padding:16 }}>
      <div style={{ width:"100%",maxWidth:460,borderRadius:24,overflow:"hidden",boxShadow:"0 24px 80px rgba(0,0,0,.7)",display:"flex",flexDirection:"column",maxHeight:"90vh" }}>

        {/* slide — scrollable content area */}
        <div style={{ background:s.bg,padding:"40px 32px 32px",position:"relative",flex:1,overflowY:"auto",display:"flex",flexDirection:"column",alignItems:"center",textAlign:"center" }}>
          {/* skip button */}
          <button onClick={onDismiss} style={{ position:"absolute",top:16,right:16,background:"rgba(255,255,255,.1)",border:"none",borderRadius:7,padding:"4px 10px",color:"rgba(255,255,255,.5)",cursor:"pointer",fontSize:11,fontWeight:600 }}>
            Skip
          </button>

          {/* emoji */}
          <div style={{ fontSize:64,marginBottom:20,lineHeight:1 }}>{s.emoji}</div>

          {/* title */}
          <div style={{ fontSize:22,fontWeight:700,color:"#fff",marginBottom:6,fontFamily:"'DM Serif Display',Georgia,serif",lineHeight:1.2 }}>
            {s.title}
          </div>

          {/* subtitle */}
          <div style={{ fontSize:12,fontWeight:600,color:s.accent,marginBottom:16,textTransform:"uppercase",letterSpacing:"1px" }}>
            {s.subtitle}
          </div>

          {/* body */}
          <div style={{ fontSize:13,color:"rgba(255,255,255,.8)",lineHeight:1.75,whiteSpace:"pre-line" }}>
            {s.body}
          </div>

          {/* install steps — only on install slide */}
          {s.installSteps && <InstallSteps accent={s.accent} />}

          {/* competition leaderboard — only on competition slide */}
          {s.competition && (
            <div style={{ width:"100%",marginTop:16 }}>
              {COMP_WINNER && (
                <div style={{ background:"rgba(251,146,60,.2)",border:"1px solid rgba(251,146,60,.4)",borderRadius:10,padding:"10px 14px",marginBottom:12,textAlign:"center" }}>
                  <div style={{ fontSize:11,color:"#fed7aa",fontWeight:700,letterSpacing:".05em",textTransform:"uppercase" }}>🎉 June Winner</div>
                  <div style={{ fontSize:18,fontWeight:900,color:"#fff",marginTop:2 }}>{COMP_WINNER}</div>
                </div>
              )}
              {LEADERBOARD.length > 0 ? (
                <div style={{ background:"rgba(0,0,0,.3)",borderRadius:10,overflow:"hidden" }}>
                  <div style={{ padding:"8px 14px",fontSize:10,fontWeight:700,color:"#9a3412",letterSpacing:".08em",textTransform:"uppercase",borderBottom:"1px solid rgba(255,255,255,.07)" }}>
                    🏆 Top Shoppers — June 2026
                  </div>
                  {LEADERBOARD.slice(0,5).map((entry,i)=>(
                    <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"8px 14px",borderBottom:i<LEADERBOARD.length-1?"1px solid rgba(255,255,255,.05)":"none",background:i===0?"rgba(251,146,60,.1)":"transparent" }}>
                      <div style={{ fontSize:14,width:20,textAlign:"center" }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                      <div style={{ flex:1,fontSize:12,fontWeight:700,color:"#f0f4f8" }}>{entry.name}</div>
                      <div style={{ fontSize:11,color:"#fb923c",fontWeight:700 }}>{entry.count} prices</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ background:"rgba(0,0,0,.3)",borderRadius:10,padding:"16px",textAlign:"center" }}>
                  <div style={{ fontSize:12,color:"rgba(255,255,255,.5)",lineHeight:1.6 }}>Leaderboard opens 1 June 2026.<br/>Be the first to submit! 🚀</div>
                </div>
              )}
              <div style={{ fontSize:10,color:"rgba(255,255,255,.35)",textAlign:"center",marginTop:10,lineHeight:1.6 }}>
                Submit prices via receipt photo · 1–30 June midnight · Winner announced 1st July 12:00pm · £10 gift voucher
              </div>
            </div>
          )}

          {/* decorative glow */}
          <div style={{ position:"absolute",bottom:-40,left:"50%",transform:"translateX(-50%)",width:200,height:200,borderRadius:"50%",background:`${s.accent}22`,pointerEvents:"none",filter:"blur(40px)" }} />
        </div>

        {/* bottom controls — sticky so always visible */}
        <div style={{ background:"#0a1a30",padding:"20px 24px 24px",display:"flex",flexDirection:"column",gap:16,flexShrink:0 }}>
          {/* dots */}
          <div style={{ display:"flex",justifyContent:"center",gap:6 }}>
            {steps.map((_,i)=>(
              <div key={i} onClick={()=>setStep(i)} style={{ width:i===step?20:6,height:6,borderRadius:3,background:i===step?s.accent:"rgba(255,255,255,.2)",cursor:"pointer",transition:"all .3s",boxShadow:i===step?`0 0 8px ${s.accent}88`:"none" }} />
            ))}
          </div>

          {/* buttons */}
          <div style={{ display:"flex",gap:10 }}>
            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ flex:1,padding:"12px",background:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",border:"1px solid rgba(125,211,252,0.2)",borderRadius:12,color:"#7dd3fc",cursor:"pointer",fontSize:13,fontWeight:700,position:"relative",overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.08)" }}>
                <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.12) 0%,rgba(255,255,255,.02) 100%)",borderRadius:"12px 12px 0 0",pointerEvents:"none" }}/>
                ← Back
              </button>
            )}
            <button
              onClick={isLast ? (s.competition ? ()=>{onDismiss();onSubmitPrice&&onSubmitPrice();} : onDismiss) : ()=>setStep(s=>s+1)}
              style={{ flex:2,padding:"12px",background:`linear-gradient(180deg,${s.accent} 0%,${s.accent}99 100%)`,border:"none",borderRadius:12,color:"#052e16",cursor:"pointer",fontSize:14,fontWeight:700,position:"relative",overflow:"hidden",boxShadow:`0 3px 12px ${s.accent}66, inset 0 1px 0 rgba(255,255,255,.3)` }}>
              <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.28) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"12px 12px 0 0",pointerEvents:"none" }}/>
              {isLast ? (s.competition ? "🏆 Enter Competition →" : "🛒 Start Saving Now →") : "Next →"}
            </button>
          </div>

          {/* jersey flag note */}
          <div style={{ textAlign:"center",fontSize:10,color:"#334155" }}>
            🇯🇪 Built for Jersey · Free forever · jerseybasket.je
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   HELP MODAL — features index
═══════════════════════════════════════════════════════════════════════════ */
const FEATURES = [
  {
    icon:"🏆", title:"Cheapest Price First",
    desc:"Every product shows the lowest available price across all 5 Jersey stores automatically."
  },
  {
    icon:"🏪", title:"Switch Stores Per Item",
    desc:"Tap the store pill on any product to see all store prices ranked cheapest to most expensive — then choose which store to buy from."
  },
  {
    icon:"📌", title:"Pin a Store",
    desc:"Tap a store chip at the top to show that store's prices for every single product at once."
  },
  {
    icon:"🧺", title:"Smart Shopping Basket",
    desc:"Add items from any store. The basket automatically shows which single store is cheapest for your whole shop and how much you'd save."
  },
  {
    icon:"♥",  title:"Favourites",
    desc:"Heart any product to save it. Your saved items have their own basket — add them all in one tap or move them to the main basket."
  },
  {
    icon:"🔍", title:"Search & Sort",
    desc:"Search across all 428+ products instantly. Sort by cheapest price, biggest saving, A–Z, or category."
  },
  {
    icon:"➕", title:"Add Your Own Items",
    desc:"Can't find something? Add any product yourself with prices from whichever stores you know."
  },
  {
    icon:"💰", title:"Savings Calculator",
    desc:"The basket tells you exactly how much you could save by switching every item to its cheapest store."
  },
  {
    icon:"📊", title:"Store Comparison",
    desc:"See how all 5 Jersey stores compare — average prices, which has the most cheapest items, and honest notes on each."
  },
  {
    icon:"📱", title:"Install as an App",
    desc:"On iPhone: tap Share → Add to Home Screen. On Android: tap the menu → Add to Home Screen. Works offline too!"
  },
  {
    icon:"🏷️", title:"Hover to See Full Name",
    desc:"If a product name is cut off, hover over it (or long-press on mobile) to see the full name pop out."
  },
  {
    icon:"🥔", title:"Local Jersey Products",
    desc:"A dedicated category for Jersey Royals, local crab, Jersey Dairy, Black Butter, and other island-specific products."
  },
];

function HelpModal({ onClose, onShare, onReplay }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)",padding:"16px" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:580,background:"#0a1a30",border:"1px solid rgba(255,255,255,.12)",borderRadius:20,maxHeight:"92vh",display:"flex",flexDirection:"column",overflow:"hidden" }}>

        {/* header */}
        <div style={{ padding:"20px 20px 0",flexShrink:0 }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4 }}>
            <div>
              <div style={{ fontSize:18,fontWeight:700,color:"#f0f4f8",marginBottom:3 }}>
                🛍️ What can JerseyBasket do?
              </div>
              <div style={{ fontSize:11,color:"#64748b" }}>
                Everything you need to shop smarter in Jersey
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14,flexShrink:0,marginLeft:12 }}>✕</button>
          </div>

          {/* stats strip */}
          <div style={{ display:"flex",gap:6,margin:"14px 0 16px",flexWrap:"wrap" }}>
            {[["428+","Products"],["5","Stores"],["15","Categories"],["🇯🇪","Jersey Only"]].map(([val,lbl])=>(
              <div key={lbl} style={{ background:"rgba(34,197,94,.09)",border:"1px solid rgba(34,197,94,.18)",borderRadius:8,padding:"5px 12px",display:"flex",alignItems:"center",gap:6 }}>
                <span style={{ fontSize:13,fontWeight:700,color:"#22c55e" }}>{val}</span>
                <span style={{ fontSize:10,color:"#64748b",textTransform:"uppercase",letterSpacing:".5px" }}>{lbl}</span>
              </div>
            ))}
          </div>
          <div style={{ height:1,background:"rgba(255,255,255,.07)",marginBottom:4 }} />
        </div>

        {/* scrollable feature list */}
        <div style={{ overflowY:"auto",padding:"4px 20px 20px",flex:1 }}>
          <div style={{ fontSize:10,color:"#475569",textAlign:"center",marginBottom:8,letterSpacing:".5px" }}>
            ↕ Scroll to see all features
          </div>
          {FEATURES.map((f,i)=>(
            <div key={i} style={{ display:"flex",gap:12,padding:"11px 0",borderBottom:i<FEATURES.length-1?"1px solid rgba(255,255,255,.05)":"none" }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(34,197,94,.1)",border:"1px solid rgba(34,197,94,.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
                {f.icon}
              </div>
              <div>
                <div style={{ fontSize:12.5,fontWeight:700,color:"#f0f4f8",marginBottom:3 }}>{f.title}</div>
                <div style={{ fontSize:11,color:"#64748b",lineHeight:1.6 }}>{f.desc}</div>
              </div>
            </div>
          ))}

          {/* install card */}
          <div style={{ marginTop:16,background:"rgba(34,197,94,.07)",border:"1px solid rgba(34,197,94,.2)",borderRadius:14,padding:"14px 16px",marginBottom:8 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div style={{ width:36,height:36,borderRadius:10,background:"rgba(34,197,94,.15)",border:"1px solid rgba(34,197,94,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>📱</div>
              <div>
                <div style={{ fontSize:12.5,fontWeight:700,color:"#f0f4f8" }}>Install on Your Phone</div>
                <div style={{ fontSize:11,color:"#64748b" }}>Add JerseyBasket to your home screen</div>
              </div>
            </div>
            <InstallSteps accent="#22c55e" compact={true} />
          </div>
        </div>

        {/* footer actions */}
        <div style={{ padding:"14px 20px 20px",flexShrink:0,borderTop:"1px solid rgba(255,255,255,.07)",display:"flex",gap:10,flexDirection:"column" }}>
          <div style={{ display:"flex",gap:10 }}>
            <button onClick={onShare} style={{ flex:1,padding:"11px",background:"rgba(99,102,241,.15)",border:"1px solid rgba(99,102,241,.35)",borderRadius:11,color:"#a5b4fc",cursor:"pointer",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",gap:6 }}>
              ↗ Share JerseyBasket.je
            </button>
            <button onClick={onClose} style={{ flex:1,padding:"11px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
              Start Shopping →
            </button>
          </div>
          <button onClick={onReplay} style={{ width:"100%",padding:"10px",background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.25)",borderRadius:11,color:"#ffffff",cursor:"pointer",fontSize:12,fontWeight:700,letterSpacing:".3px" }}
            onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,.18)";e.currentTarget.style.borderColor="rgba(255,255,255,.4)";}}
            onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,.1)";e.currentTarget.style.borderColor="rgba(255,255,255,.25)";}}>
            🎬 Replay the Welcome Guide
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   REPORT PROBLEM MODAL
═══════════════════════════════════════════════════════════════════════════ */
function ReportModal({ onClose }) {
  const [form,   setForm]   = useState({ type:"wrong_price", product:"", detail:"" });
  const [status, setStatus] = useState("idle");

  const TYPES = [
    { id:"wrong_price",   label:"💰 Wrong price",          placeholder:"e.g. Co-op Full Fat Milk 2L shows £1.75 but it's actually £1.95" },
    { id:"missing_item",  label:"➕ Missing product",       placeholder:"e.g. Oat Milk 1L is not listed anywhere" },
    { id:"store_issue",   label:"🏪 Store info wrong",      placeholder:"e.g. Waitrose is showing wrong location" },
    { id:"app_problem",   label:"🐛 App not working right", placeholder:"e.g. The basket total is calculating incorrectly" },
    { id:"other",         label:"💬 Other feedback",        placeholder:"Tell us anything you'd like to improve" },
  ];

  const selectedType = TYPES.find(t=>t.id===form.type);

  const handleSubmit = async () => {
    if(!form.detail.trim()){return;}
    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify({
          _subject: `Problem Report — JerseyBasket.je`,
          type: selectedType?.label,
          product: form.product || "Not specified",
          detail: form.detail,
          message: `PROBLEM REPORT\n\nType: ${selectedType?.label}\nProduct: ${form.product||"Not specified"}\nDetails: ${form.detail}`,
        })
      });
      if(res.ok){ setStatus("sent"); }
      else { setStatus("error"); }
    } catch { setStatus("error"); }
  };

  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"#0a1a30",border:"1px solid rgba(255,255,255,.12)",borderRadius:"20px 20px 0 0",padding:"22px 20px 30px",maxHeight:"82vh",overflowY:"auto",paddingBottom:"calc(10vh + 32px)" }}>

        {status==="sent" ? (
          <div style={{ textAlign:"center",padding:"30px 0" }}>
            <div style={{ fontSize:44,marginBottom:14 }}>🙏</div>
            <div style={{ fontSize:17,fontWeight:700,color:"#22c55e",marginBottom:8 }}>Thanks for the report!</div>
            <div style={{ fontSize:12,color:"#94a3b8",lineHeight:1.7,marginBottom:22 }}>
              We'll look into it and fix it as soon as possible.<br/>
              JerseyBasket is better because of people like you.
            </div>
            <button onClick={onClose} style={{ padding:"10px 28px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
              Back to App
            </button>
          </div>
        ) : (
          <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16 }}>
              <div>
                <div style={{ fontSize:17,fontWeight:700,color:"#f0f4f8" }}>🚩 Report a Problem</div>
                <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>Help us keep JerseyBasket accurate</div>
              </div>
              <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14 }}>✕</button>
            </div>

            {/* problem type */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:8 }}>WHAT'S THE PROBLEM?</div>
              <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
                {TYPES.map(t=>(
                  <button key={t.id} onClick={()=>setForm(p=>({...p,type:t.id}))}
                    style={{ padding:"9px 13px",borderRadius:9,border:`1px solid ${form.type===t.id?"rgba(34,197,94,.4)":"rgba(255,255,255,.08)"}`,background:form.type===t.id?"rgba(34,197,94,.12)":"rgba(255,255,255,.04)",color:form.type===t.id?"#86efac":"#94a3b8",cursor:"pointer",fontSize:12,fontWeight:form.type===t.id?700:400,textAlign:"left",transition:"all .15s" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* product name (optional) */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>PRODUCT NAME <span style={{ color:"#334155",fontWeight:400 }}>(optional)</span></div>
              <input value={form.product} onChange={e=>setForm(p=>({...p,product:e.target.value}))} placeholder="e.g. Full Fat Milk 2L"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box" }} />
            </div>

            {/* detail */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:10,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>DETAILS <span style={{ color:"#f43f5e" }}>*</span></div>
              <textarea value={form.detail} onChange={e=>setForm(p=>({...p,detail:e.target.value}))} rows={3}
                placeholder={selectedType?.placeholder}
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:`1px solid ${!form.detail.trim()&&status==="error"?"rgba(239,68,68,.5)":"rgba(255,255,255,.11)"}`,borderRadius:9,color:"#fff",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5 }} />
            </div>

            {status==="error"&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",borderRadius:8,padding:"7px 12px",fontSize:11,color:"#fca5a5",marginBottom:12 }}>Something went wrong. Please email hello@jerseybasket.je</div>}

            <button onClick={handleSubmit} disabled={!form.detail.trim()||status==="sending"}
              style={{ width:"100%",padding:"12px",background:!form.detail.trim()||status==="sending"?"rgba(34,197,94,.3)":"linear-gradient(135deg,#16a34a,#15803d)",border:"none",borderRadius:12,color:"#fff",cursor:!form.detail.trim()?"not-allowed":"pointer",fontSize:14,fontWeight:700 }}>
              {status==="sending" ? "Sending…" : "Send Report →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ENQUIRY MODAL — friendly in-app contact form, no email client needed
═══════════════════════════════════════════════════════════════════════════ */
function EnquiryModal({ onClose }) {
  const [form,    setForm]    = useState({ name:"", business:"", email:"", message:"I am interested in advertising on JerseyBasket.je. Please send me more information about available banner slots and pricing." });
  const [status,  setStatus]  = useState("idle"); // idle | sending | sent | error
  const [touched, setTouched] = useState({});

  const valid = form.name.trim() && form.email.includes("@") && form.message.trim();

  const handleSubmit = async () => {
    setTouched({ name:true, email:true, message:true });
    if (!valid) return;
    setStatus("sending");
    try {
      // Formspree — free tier handles 50 submissions/month
      // Replace YOUR_FORM_ID with your Formspree form ID (free at formspree.io)
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Accept":"application/json" },
        body: JSON.stringify({
          name:     form.name,
          business: form.business,
          email:    form.email,
          message:  form.message,
          _subject: "Banner Advertising Enquiry — JerseyBasket.je",
        })
      });
      if (res.ok) { setStatus("sent"); }
      else        { setStatus("error"); }
    } catch {
      setStatus("error");
    }
  };

  const field = (key, label, placeholder, type="text", rows=0) => (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:".5px", textTransform:"uppercase", color:"#64748b", marginBottom:5 }}>
        {label}{key!=="business"&&<span style={{ color:"#f43f5e" }}> *</span>}
      </label>
      {rows > 0 ? (
        <textarea
          value={form[key]}
          onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
          onBlur={()=>setTouched(p=>({...p,[key]:true}))}
          rows={rows}
          placeholder={placeholder}
          style={{ width:"100%", padding:"9px 12px", background:"rgba(255,255,255,.07)", border:`1px solid ${touched[key]&&!form[key].trim()?"rgba(244,63,94,.5)":"rgba(255,255,255,.12)"}`, borderRadius:9, color:"#fff", fontSize:12, outline:"none", resize:"none", boxSizing:"border-box", fontFamily:"inherit", lineHeight:1.5 }}
        />
      ) : (
        <input
          type={type}
          value={form[key]}
          onChange={e=>setForm(p=>({...p,[key]:e.target.value}))}
          onBlur={()=>setTouched(p=>({...p,[key]:true}))}
          placeholder={placeholder}
          style={{ width:"100%", padding:"9px 12px", background:"rgba(255,255,255,.07)", border:`1px solid ${touched[key]&&(key==="email"?!form[key].includes("@"):!form[key].trim())?"rgba(244,63,94,.5)":"rgba(255,255,255,.12)"}`, borderRadius:9, color:"#fff", fontSize:12, outline:"none", boxSizing:"border-box" }}
        />
      )}
      {touched[key] && key!=="business" && (key==="email" ? !form.email.includes("@") : !form[key].trim()) && (
        <div style={{ fontSize:10, color:"#f87171", marginTop:3 }}>Required</div>
      )}
    </div>
  );

  return (
    <div style={{ position:"fixed", inset:0, zIndex:500, display:"flex", alignItems:"flex-end", justifyContent:"center", background:"rgba(0,0,0,.75)", backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%", maxWidth:520, background:"#0a1a30", border:"1px solid rgba(255,255,255,.12)", borderRadius:"20px 20px 0 0", padding:"24px 20px 32px", maxHeight:"82vh", overflowY:"auto", paddingBottom:"calc(10vh + 32px)" }}>

        {status === "sent" ? (
          <div style={{ textAlign:"center", padding:"30px 10px" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#22c55e", marginBottom:8 }}>Enquiry Sent!</div>
            <div style={{ fontSize:13, color:"#94a3b8", lineHeight:1.7, marginBottom:24 }}>
              Thanks for your interest in advertising on JerseyBasket.je.<br/>
              Eamonn will be in touch shortly at <strong style={{ color:"#f0f4f8" }}>{form.email}</strong>
            </div>
            <button onClick={onClose} style={{ padding:"10px 28px", background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)", border:"none", borderRadius:11, color:"#fff", cursor:"pointer", fontSize:13, fontWeight:700 }}>
              Back to App
            </button>
          </div>
        ) : (
          <>
            {/* header */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:20 }}>
              <div>
                <div style={{ fontSize:18, fontWeight:700, color:"#f0f4f8", marginBottom:3 }}>📢 Advertise on JerseyBasket.je</div>
                <div style={{ fontSize:11, color:"#64748b", lineHeight:1.6 }}>
                  Reach Jersey's grocery shoppers every day.<br/>
                  Banner slots from <strong style={{ color:"#22c55e" }}>£99/month</strong> — limited availability.
                </div>
              </div>
              <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)", border:"none", borderRadius:7, width:28, height:28, color:"#94a3b8", cursor:"pointer", fontSize:14, flexShrink:0, marginLeft:12 }}>✕</button>
            </div>

            {/* stats row */}
            <div style={{ display:"flex", gap:8, marginBottom:20 }}>
              {[["428+","products listed"],["5","stores compared"],["Jersey","audience only"],["Daily","active users"]].map(([val,lbl])=>(
                <div key={lbl} style={{ flex:1, background:"rgba(34,197,94,.08)", border:"1px solid rgba(34,197,94,.15)", borderRadius:9, padding:"7px 4px", textAlign:"center" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#22c55e" }}>{val}</div>
                  <div style={{ fontSize:8, color:"#64748b", marginTop:1, textTransform:"uppercase", letterSpacing:".5px" }}>{lbl}</div>
                </div>
              ))}
            </div>

            {/* form */}
            {field("name",     "Your Name",     "e.g. John Smith")}
            {field("business", "Business Name (optional)", "e.g. Smith's Bakery, St Helier")}
            {field("email",    "Email Address", "e.g. john@yourbusiness.je", "email")}
            {field("message",  "Message",       "Tell us about your business...", "text", 3)}

            {status === "error" && (
              <div style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.28)", borderRadius:8, padding:"8px 12px", fontSize:11, color:"#fca5a5", marginBottom:12 }}>
                Something went wrong. Please email us directly at <strong>hello@jerseybasket.je</strong>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={status==="sending"}
              style={{ width:"100%", padding:"13px", background:status==="sending"?"rgba(34,197,94,.4)":"linear-gradient(135deg,#16a34a,#15803d)", border:"none", borderRadius:12, color:"#fff", cursor:status==="sending"?"wait":"pointer", fontSize:14, fontWeight:700, transition:"all .2s" }}>
              {status==="sending" ? "Sending…" : "Send Enquiry →"}
            </button>

            <div style={{ textAlign:"center", fontSize:10, color:"#334155", marginTop:10 }}>
              Or email directly: <a href="mailto:hello@jerseybasket.je" style={{ color:"#22c55e" }}>hello@jerseybasket.je</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SETTINGS MODAL — store on/off toggles
═══════════════════════════════════════════════════════════════════════════ */
function SettingsModal({ disabledStores, onToggleStore, onClose }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.75)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"#0a1a30",border:"1px solid rgba(255,255,255,.12)",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",paddingBottom:"calc(10vh + 32px)" }}>

        {/* header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
          <div>
            <div style={{ fontSize:17,fontWeight:700,color:"#f0f4f8" }}>⚙️ Settings</div>
            <div style={{ fontSize:11,color:"#64748b",marginTop:2 }}>Hide stores you don't want to see</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14 }}>✕</button>
        </div>

        {/* store toggles */}
        <div style={{ fontSize:10,color:"#64748b",fontWeight:700,letterSpacing:".5px",marginBottom:10 }}>SHOW / HIDE STORES</div>
        <div style={{ display:"flex",flexDirection:"column",gap:8,marginBottom:20 }}>
          {STORES.map(store => {
            const enabled = !disabledStores.has(store.id);
            return (
              <div key={store.id} onClick={()=>onToggleStore(store.id)}
                style={{ display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 16px",borderRadius:12,cursor:"pointer",
                  background:enabled?`${store.color}12`:"rgba(255,255,255,.03)",
                  border:`1px solid ${enabled?store.color+"40":"rgba(255,255,255,.07)"}`,
                  opacity:enabled?1:0.5, transition:"all .2s" }}>
                <div style={{ display:"flex",alignItems:"center",gap:10 }}>
                  <span style={{ fontSize:20 }}>{store.emoji}</span>
                  <div>
                    <div style={{ fontSize:13,fontWeight:700,color:enabled?"#f0f4f8":"#64748b" }}>{store.name}</div>
                    <div style={{ fontSize:10,color:"#475569",marginTop:1 }}>{store.note}</div>
                  </div>
                </div>
                {/* toggle pill */}
                <div style={{ width:44,height:24,borderRadius:12,background:enabled?store.color:"rgba(255,255,255,.1)",position:"relative",transition:"background .2s",flexShrink:0 }}>
                  <div style={{ position:"absolute",top:3,left:enabled?22:3,width:18,height:18,borderRadius:"50%",background:"#fff",transition:"left .2s",boxShadow:"0 1px 4px rgba(0,0,0,.4)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {disabledStores.size > 0 && (
          <div style={{ background:"rgba(251,191,36,.07)",border:"1px solid rgba(251,191,36,.2)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:11,color:"#fcd34d",lineHeight:1.6 }}>
            ⚠️ {disabledStores.size} store{disabledStores.size>1?"s":""} hidden. Prices from hidden stores won't appear in product cards or the basket.
          </div>
        )}

        <button onClick={onClose} style={{ width:"100%",padding:"13px",background:"linear-gradient(180deg,#4ade80 0%,#15803d 100%)",boxShadow:"0 3px 10px rgba(34,197,94,.5),inset 0 1px 0 rgba(255,255,255,.3)",border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700 }}>
          Done
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COMPETITION MODAL — June Price Hunt leaderboard + info
═══════════════════════════════════════════════════════════════════════════ */
function CompetitionModal({ onClose, onSubmit }) {
  return (
    <div style={{ position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"#120800",border:"1px solid rgba(251,146,60,.25)",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",paddingBottom:"calc(10vh + 32px)",maxHeight:"82vh",overflowY:"auto" }}>

        {/* header */}
        <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20 }}>
          <div>
            <div style={{ fontSize:17,fontWeight:700,color:"#fed7aa" }}>🏆 June Price Hunt</div>
            <div style={{ fontSize:11,color:"#9a3412",marginTop:2 }}>1st June – 30th June 2026 midnight · Winner announced 1st July 12:00pm</div>
          </div>
          <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14 }}>✕</button>
        </div>

        {/* winner banner */}
        {COMP_WINNER && (
          <div style={{ background:"linear-gradient(135deg,rgba(251,146,60,.2),rgba(234,88,12,.15))",border:"1px solid rgba(251,146,60,.4)",borderRadius:12,padding:"14px 18px",marginBottom:16,textAlign:"center" }}>
            <div style={{ fontSize:11,color:"#fed7aa",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase" }}>🎉 June 2026 Winner</div>
            <div style={{ fontSize:24,fontWeight:900,color:"#fff",margin:"6px 0 2px" }}>{COMP_WINNER}</div>
            <div style={{ fontSize:11,color:"#fb923c" }}>Congratulations! 🎊</div>
          </div>
        )}

        {/* how it works */}
        <div style={{ background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.07)",borderRadius:12,padding:"14px 16px",marginBottom:16 }}>
          <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10 }}>HOW IT WORKS</div>
          {[
            ["📸","Take a photo of your receipt","From any of Jersey's 5 supermarkets"],
            ["📤","Submit it via the form below","Include your name and which store"],
            ["✅","We manually check every receipt","Store name, date & prices must be clearly visible — duplicates rejected"],
            ["🏆","Top 5 shown on the leaderboard","Updated weekly throughout June"],
            ["🎁","Win a £10 gift voucher","Announced 1st July 2026 at 12:00pm"],
          ].map(([icon,title,sub],i)=>(
            <div key={i} style={{ display:"flex",gap:12,marginBottom:i<4?10:0 }}>
              <span style={{ fontSize:18,flexShrink:0 }}>{icon}</span>
              <div>
                <div style={{ fontSize:12,fontWeight:700,color:"#f0f4f8" }}>{title}</div>
                <div style={{ fontSize:10,color:"#64748b",marginTop:1 }}>{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* rules */}
        <div style={{ background:"rgba(255,255,255,.02)",borderRadius:10,padding:"10px 14px",marginBottom:16,fontSize:10,color:"#64748b",lineHeight:1.8 }}>
          <div style={{ fontWeight:700,color:"#475569",marginBottom:4 }}>Rules</div>
          • Each receipt can only be submitted once<br/>
          • Receipt must show the store name and date clearly<br/>
          • All receipts are manually checked before prices are counted<br/>
          • Only receipts dated within June 2026 are valid<br/>
          • Prices must be from Jersey stores only<br/>
          • Only new prices not already in the app count<br/>
          • First name + last initial only shown on leaderboard<br/>
          • Competition closes 30th June 2026 at midnight<br/>
          • Winner announced 1st July 2026 at 12:00pm<br/>
          • Winner contacted via the email or phone provided<br/>
          • £10 prize — store of winner's choice<br/>
          • JerseyBasket decision is final
        </div>

        {/* leaderboard */}
        <div style={{ marginBottom:20 }}>
          <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".08em",textTransform:"uppercase",marginBottom:10 }}>TOP SHOPPERS — JUNE 2026</div>
          {LEADERBOARD.length > 0 ? (
            <div style={{ display:"flex",flexDirection:"column",gap:6 }}>
              {LEADERBOARD.slice(0,5).map((entry,i)=>(
                <div key={i} style={{ display:"flex",alignItems:"center",gap:10,padding:"11px 14px",borderRadius:10,background:i===0?"rgba(251,146,60,.15)":"rgba(255,255,255,.04)",border:`1px solid ${i===0?"rgba(251,146,60,.3)":"rgba(255,255,255,.06)"}` }}>
                  <div style={{ fontSize:16,width:24,textAlign:"center" }}>{["🥇","🥈","🥉","4️⃣","5️⃣"][i]}</div>
                  <div style={{ flex:1,fontSize:13,fontWeight:700,color:"#f0f4f8" }}>{entry.name}</div>
                  <div style={{ fontSize:12,color:"#fb923c",fontWeight:700 }}>{entry.count} prices</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ background:"rgba(255,255,255,.03)",borderRadius:10,padding:"20px",textAlign:"center" }}>
              <div style={{ fontSize:24,marginBottom:8 }}>🚀</div>
              <div style={{ fontSize:12,color:"rgba(255,255,255,.4)",lineHeight:1.6 }}>Leaderboard opens 1 June 2026.<br/>Be the first to submit a price!</div>
            </div>
          )}
        </div>

        <button onClick={onSubmit} style={{ width:"100%",padding:"14px",background:"linear-gradient(180deg,#fb923c 0%,#b45309 100%)",boxShadow:"0 3px 10px rgba(194,65,12,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:12,color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700,marginBottom:10 }}>
          📸 Submit a Price Now →
        </button>
        <button onClick={onClose} style={{ width:"100%",padding:"12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.1)",borderRadius:12,color:"#94a3b8",cursor:"pointer",fontSize:13,fontWeight:600 }}>
          Back to App
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   SUBMIT PRICE MODAL — competition price submission via Formspree
═══════════════════════════════════════════════════════════════════════════ */
function SubmitPriceModal({ onClose }) {
  const [form,   setForm]   = useState({ name:"", mobile:"", email:"", store:"coop", product:"", price:"", detail:"" });
  const [status, setStatus] = useState("idle");

  const handleSubmit = async () => {
    if(!form.name.trim()||!form.mobile.trim()||!form.email.trim()){return;}
    setStatus("sending");
    const storeName = STORES.find(s=>s.id===form.store)?.name||form.store;
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`,{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body: JSON.stringify({
          _subject:`🏆 June Competition Entry — ${form.name}`,
          name: form.name,
          mobile: form.mobile,
          email: form.email,
          store: storeName,
          product: form.product||"Not specified",
          price: form.price?`£${form.price}`:"Not specified",
          detail: form.detail||"No additional notes",
          message:`JUNE COMPETITION ENTRY\n\nName: ${form.name}\nMobile: ${form.mobile}\nEmail: ${form.email}\nStore: ${storeName}\nProduct: ${form.product||"Not specified"}\nPrice: ${form.price?`£${form.price}`:"Not specified"}\nNotes: ${form.detail||"None"}`,
        })
      });
      if(res.ok){ setStatus("sent"); }
      else { setStatus("error"); }
    } catch { setStatus("error"); }
  };

  const required = !form.name.trim()||!form.mobile.trim()||!form.email.trim();

  return (
    <div style={{ position:"fixed",inset:0,zIndex:600,display:"flex",alignItems:"flex-end",justifyContent:"center",paddingTop:60,background:"rgba(0,0,0,.8)",backdropFilter:"blur(8px)" }}
      onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ width:"100%",maxWidth:520,background:"#120800",border:"1px solid rgba(251,146,60,.25)",borderRadius:"20px 20px 0 0",padding:"24px 20px 32px",paddingBottom:"calc(10vh + 32px)",maxHeight:"82vh",overflowY:"auto" }}>

        {status==="sent" ? (
          <div style={{ textAlign:"center",padding:"30px 0" }}>
            <div style={{ fontSize:48,marginBottom:14 }}>🏆</div>
            <div style={{ fontSize:18,fontWeight:700,color:"#fb923c",marginBottom:8 }}>Entry submitted!</div>
            <div style={{ fontSize:12,color:"#94a3b8",lineHeight:1.8,marginBottom:24 }}>
              Thanks {form.name.split(" ")[0]}! We'll verify the price and add it<br/>
              to the leaderboard within 24 hours.<br/>
              If you win, we'll contact you on <span style={{ color:"#fb923c" }}>{form.mobile}</span>.<br/>
              Keep those receipts coming! 📸
            </div>
            <button onClick={onClose} style={{ padding:"11px 28px",background:"linear-gradient(180deg,#fb923c 0%,#b45309 100%)",boxShadow:"0 3px 10px rgba(194,65,12,.5),inset 0 1px 0 rgba(255,255,255,.25)",border:"none",borderRadius:11,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700 }}>
              Back to App
            </button>
          </div>
        ) : (
          <>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18 }}>
              <div>
                <div style={{ fontSize:17,fontWeight:700,color:"#fed7aa" }}>📸 Submit a Price</div>
                <div style={{ fontSize:11,color:"#9a3412",marginTop:2 }}>June competition · Every price counts!</div>
              </div>
              <button onClick={onClose} style={{ background:"rgba(255,255,255,.07)",border:"none",borderRadius:7,width:28,height:28,color:"#94a3b8",cursor:"pointer",fontSize:14 }}>✕</button>
            </div>

            {/* name */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>YOUR NAME <span style={{ color:"#f43f5e" }}>*</span></div>
              <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="First name + last initial e.g. Sarah M"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
              <div style={{ fontSize:10,color:"#475569",marginTop:4 }}>Only your first name + last initial will appear on the leaderboard</div>
            </div>

            {/* contact */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>MOBILE NUMBER <span style={{ color:"#f43f5e" }}>*</span></div>
              <input value={form.mobile} onChange={e=>setForm(p=>({...p,mobile:e.target.value}))} placeholder="e.g. 07797 123456"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
            </div>
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>EMAIL ADDRESS <span style={{ color:"#f43f5e" }}>*</span></div>
              <input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="e.g. yourname@email.com"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
              <div style={{ fontSize:10,color:"#475569",marginTop:4 }}>Never shared publicly — only used to contact the winner</div>
            </div>

            {/* store */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>STORE <span style={{ color:"#f43f5e" }}>*</span></div>
              <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                {STORES.map(s=>(
                  <button key={s.id} onClick={()=>setForm(p=>({...p,store:s.id}))}
                    style={{ padding:"7px 12px",borderRadius:22,border:`1px solid ${form.store===s.id?s.color+"80":"rgba(255,255,255,.08)"}`,
                      background:form.store===s.id?`linear-gradient(180deg,${s.color}dd 0%,${s.color}88 100%)`:"linear-gradient(180deg,#1e3a5f 0%,#0f1f3d 100%)",
                      color:form.store===s.id?"#fff":"#64748b",cursor:"pointer",fontSize:11,fontWeight:700,transition:"all .15s",
                      boxShadow:form.store===s.id?`0 3px 10px ${s.color}55,inset 0 1px 0 rgba(255,255,255,.2)`:"0 2px 4px rgba(0,0,0,.3)",
                      position:"relative",overflow:"hidden",
                    }}>
                    <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"22px 22px 0 0",pointerEvents:"none" }}/>
                    {s.emoji} {s.name}
                  </button>
                ))}
              </div>
            </div>

            {/* product */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>PRODUCT NAME <span style={{ color:"#334155",fontWeight:400 }}>(optional)</span></div>
              <input value={form.product} onChange={e=>setForm(p=>({...p,product:e.target.value}))} placeholder="e.g. Full Fat Milk 2L"
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
            </div>

            {/* price */}
            <div style={{ marginBottom:12 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>PRICE <span style={{ color:"#334155",fontWeight:400 }}>(optional)</span></div>
              <div style={{ position:"relative" }}>
                <span style={{ position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:"#64748b",fontSize:13,fontWeight:700 }}>£</span>
                <input type="number" step="0.01" value={form.price} onChange={e=>setForm(p=>({...p,price:e.target.value}))} placeholder="0.00"
                  style={{ width:"100%",padding:"9px 12px 9px 26px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit" }} />
              </div>
            </div>

            {/* notes */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:10,color:"#9a3412",fontWeight:700,letterSpacing:".5px",marginBottom:6 }}>NOTES <span style={{ color:"#334155",fontWeight:400 }}>(optional)</span></div>
              <textarea value={form.detail} onChange={e=>setForm(p=>({...p,detail:e.target.value}))} rows={2}
                placeholder="e.g. pack size, variant, on promotion, etc."
                style={{ width:"100%",padding:"9px 12px",background:"rgba(255,255,255,.07)",border:"1px solid rgba(255,255,255,.11)",borderRadius:9,color:"#fff",fontSize:12,outline:"none",resize:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.5 }} />
            </div>

            <div style={{ background:"rgba(251,146,60,.07)",border:"1px solid rgba(251,146,60,.2)",borderRadius:9,padding:"9px 13px",fontSize:10,color:"#9a3412",lineHeight:1.7,marginBottom:10 }}>
              📸 <strong style={{ color:"#fed7aa" }}>Got a receipt?</strong> Email a photo to <span style={{ color:"#fb923c" }}>hello@jerseybasket.je</span> with your name and we'll count all the prices on it! Make sure the <strong style={{ color:"#fed7aa" }}>store name, date, and prices are clearly visible</strong>.
            </div>
            <a href={`mailto:hello@jerseybasket.je?subject=🏆 June Competition Receipt — ${form.name||"Entry"}&body=Hi Eamonn, please find my receipt photo attached.%0A%0AName: ${form.name||""}%0AMobile: ${form.mobile||""}%0AStore: ${STORES.find(s=>s.id===form.store)?.name||""}`}
              style={{ display:"flex",alignItems:"center",justifyContent:"center",gap:8,width:"100%",padding:"11px",background:"linear-gradient(180deg,#fbbf24 0%,#b45309 100%)",border:"none",borderRadius:10,color:"#fff",textDecoration:"none",fontSize:13,fontWeight:700,marginBottom:14,boxSizing:"border-box",boxShadow:"0 3px 10px rgba(180,83,9,.5),inset 0 1px 0 rgba(255,255,255,.25)",position:"relative",overflow:"hidden" }}>
              <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"10px 10px 0 0",pointerEvents:"none" }}/>
              📸 Email Receipt Photo
            </a>

            {status==="error"&&<div style={{ background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.28)",borderRadius:8,padding:"7px 12px",fontSize:11,color:"#fca5a5",marginBottom:12 }}>Something went wrong. Please email hello@jerseybasket.je</div>}

            <button onClick={handleSubmit} disabled={required||status==="sending"}
              style={{ width:"100%",padding:"13px",background:required||status==="sending"?"rgba(234,88,12,.3)":"linear-gradient(180deg,#fb923c 0%,#b45309 100%)",border:"none",borderRadius:12,color:"#fff",cursor:required?"not-allowed":"pointer",fontSize:14,fontWeight:700,boxShadow:required||status==="sending"?"none":"0 3px 12px rgba(194,65,12,.6),inset 0 1px 0 rgba(255,255,255,.25)",position:"relative",overflow:"hidden" }}>
              <span style={{ position:"absolute",top:0,left:0,right:0,height:"52%",background:"linear-gradient(180deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,.04) 100%)",borderRadius:"12px 12px 0 0",pointerEvents:"none" }}/>
              {status==="sending" ? "Submitting…" : "Submit Entry →"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

function AdBanner({ onEnquiry }) {
  const PAUSE_MS  = 2000;
  const SLIDE_MS  = 620;
  const COUNT     = AD_SLIDES.length;

  const [current,  setCurrent]  = useState(0);
  const [offset,   setOffset]   = useState(0);   // 0..COUNT-1 (fractional during animation)
  const [paused,   setPaused]   = useState(false);
  const [progress, setProgress] = useState(0);

  const currentRef = useRef(0);
  const timerRef   = useRef(null);
  const rafRef     = useRef(null);
  const pauseRef   = useRef(false);
  const startRef   = useRef(null);
  const animRef    = useRef(null); // rAF for slide animation

  // ── smooth slide to a target index ──────────────────────────────────────
  const slideTo = useCallback((target) => {
    cancelAnimationFrame(animRef.current);
    const from    = currentRef.current;
    const started = performance.now();
    // ease in-out cubic
    const ease = t => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;

    const step = (now) => {
      const t = Math.min((now - started) / SLIDE_MS, 1);
      setOffset(from + (target - from) * ease(t));
      if (t < 1) {
        animRef.current = requestAnimationFrame(step);
      } else {
        setOffset(target);
        setCurrent(target);
        currentRef.current = target;
      }
    };
    animRef.current = requestAnimationFrame(step);
  }, []);

  // ── progress bar tick ────────────────────────────────────────────────────
  const startTick = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    setProgress(0);
    startRef.current = performance.now();
    const tick = (now) => {
      if (pauseRef.current) return;
      const frac = Math.min((now - startRef.current) / PAUSE_MS, 1);
      setProgress(frac);
      if (frac < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  // ── schedule next advance ─────────────────────────────────────────────────
  const schedule = useCallback((after = PAUSE_MS) => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (pauseRef.current) return;
      const next = (currentRef.current + 1) % COUNT;
      slideTo(next);
      startTick();
      schedule();
    }, after);
  }, [slideTo, startTick, COUNT]);

  // boot
  useEffect(() => {
    startTick();
    schedule();
    return () => {
      clearTimeout(timerRef.current);
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(animRef.current);
    };
  }, [schedule, startTick]);
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        // Page is visible again — clear everything and restart cleanly
        pauseRef.current = false;
        setPaused(false);
        clearTimeout(timerRef.current);
        cancelAnimationFrame(rafRef.current);
        cancelAnimationFrame(animRef.current);
        startTick();
        schedule();
      } else {
        // Page hidden — pause everything to save resources
        clearTimeout(timerRef.current);
        cancelAnimationFrame(rafRef.current);
        cancelAnimationFrame(animRef.current);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [startTick, schedule]);

  // hover pause / resume
  const handleEnter = () => {
    pauseRef.current = true;
    setPaused(true);
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
  };
  const handleLeave = () => {
    pauseRef.current = false;
    setPaused(false);
    startTick();
    schedule();
  };

  // dot / swipe jump
  const jumpTo = useCallback((idx) => {
    clearTimeout(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    slideTo(idx);
    startTick();
    schedule();
  }, [slideTo, startTick, schedule]);

  // touch swipe
  const touchX = useRef(0);
  const mouseDownX = useRef(0);
  const handleTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const handleTouchEnd   = (e) => {
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) jumpTo(dx < 0 ? (current+1)%COUNT : (current-1+COUNT)%COUNT);
  };

  // track translateX: offset=0 → 0%, offset=1 → -100%, etc.
  const trackX = -(offset / COUNT) * 100;

  return (
    <div
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onMouseDown={e=>{ mouseDownX.current = e.clientX; }}
      onClick={(e)=>{
        // Only fire if mouse didn't move (real click not drag)
        if(Math.abs(e.clientX - mouseDownX.current) > 5) return;
        const s = AD_SLIDES[current];
        if(!s) return;
        if(s.link===ENQUIRY_TRIGGER){ onEnquiry(); }
        else { window.open(s.link,"_blank","noopener,noreferrer"); }
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      style={{
        position:"fixed", bottom:0, left:0, right:0,
        height:"10vh", minHeight:56, maxHeight:80,
        zIndex:200, overflow:"hidden",
        boxShadow:"0 -2px 16px rgba(0,0,0,0.35)",
        borderTop:"1px solid rgba(255,255,255,0.06)",
        cursor:"pointer",
      }}
    >
      {/* ── SLIDING TRACK ── all 4 slides sit side-by-side, track translates */}
      <div style={{
        display:"flex",
        width:`${COUNT * 100}%`,
        height:"100%",
        transform:`translateX(${trackX}%)`,
        transition:"none",   /* animation is driven by rAF, not CSS */
        willChange:"transform",
      }}>
        {AD_SLIDES.map((s) => (
          <div
            key={s.id}
            style={{
              width:`${100/COUNT}%`,
              height:"100%",
              flexShrink:0,
              position:"relative",
              overflow:"hidden",
              background: s.bg,
              opacity: 0.92,
              display:"block",
              textDecoration:"none",
            }}
          >
            {/* ── per-slide decorations ── */}
            {s.grid && (
              <div style={{ position:"absolute",inset:0,opacity:0.04,pointerEvents:"none",
                backgroundImage:"linear-gradient(#f59e0b 1px,transparent 1px),linear-gradient(90deg,#f59e0b 1px,transparent 1px)",
                backgroundSize:"40px 40px" }} />
            )}
            {s.deco && (
              <>
                <div style={{ position:"absolute",width:260,height:260,borderRadius:"50%",background:"rgba(74,222,128,0.07)",right:-50,top:-70,pointerEvents:"none" }} />
                <div style={{ position:"absolute",width:140,height:140,borderRadius:"50%",background:"rgba(74,222,128,0.07)",right:90,bottom:-45,pointerEvents:"none" }} />
              </>
            )}
            {s.cross && (
              <div style={{ position:"absolute",right:0,top:0,bottom:0,width:160,opacity:0.07,display:"flex",alignItems:"center",justifyContent:"center",pointerEvents:"none" }}>
                <div style={{ position:"relative",width:100,height:100 }}>
                  <div style={{ position:"absolute",top:"50%",left:0,right:0,height:30,background:"white",transform:"translateY(-50%)",borderRadius:4 }} />
                  <div style={{ position:"absolute",left:"50%",top:0,bottom:0,width:30,background:"white",transform:"translateX(-50%)",borderRadius:4 }} />
                </div>
              </div>
            )}
            {s.accent      && <div style={{ position:"absolute",top:0,left:0,right:0,height:3,background:s.accent,pointerEvents:"none" }} />}
            {s.accentBottom && <div style={{ position:"absolute",bottom:2,left:0,right:0,height:3,background:s.accentBottom,pointerEvents:"none" }} />}

            {/* ── CONTENT — single tight row ── */}
            <div style={{
              position:"relative", zIndex:2, height:"100%",
              display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"0 clamp(12px,3vw,32px)",
              gap:"clamp(8px,2vw,24px)",
              maxWidth:1100, margin:"0 auto", boxSizing:"border-box",
            }}>
              {/* LEFT — eyebrow + headline on one line */}
              <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,1.5vw,14px)", minWidth:0, flex:1 }}>
                <div style={{ fontFamily:"'DM Sans',Arial,sans-serif", fontSize:"clamp(7px,1vh,9px)", fontWeight:700, letterSpacing:"1.5px", textTransform:"uppercase", color:s.eyebrow.color, borderLeft:`2px solid ${s.eyebrow.color}`, paddingLeft:6, lineHeight:1, whiteSpace:"nowrap", flexShrink:0 }}>
                  {s.eyebrow.text}
                </div>
                <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(12px,2vh,18px)", lineHeight:1.2, letterSpacing:"-0.3px", color:s.headline.headlineColor||"#f0f4f8", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
                  {s.headline.before}
                  <span style={{
                    color: s.headline.highlightGold||s.headline.highlightGreen ? "transparent" : s.headline.highlightColor,
                    fontStyle:"italic",
                    textDecoration: s.headline.highlightUnderline ? "underline" : "none",
                    textUnderlineOffset:3, textDecorationThickness:1.5,
                    ...(s.headline.highlightGold  ? { background:"linear-gradient(90deg,#f59e0b,#fbbf24,#f59e0b)", WebkitBackgroundClip:"text", backgroundClip:"text" } : {}),
                    ...(s.headline.highlightGreen ? { background:"linear-gradient(135deg,#16a34a,#22c55e)",        WebkitBackgroundClip:"text", backgroundClip:"text" } : {}),
                  }}>{s.headline.highlight}</span>
                  {s.headline.after}
                </div>
                <div style={{ fontFamily:"'DM Sans',Arial,sans-serif", fontSize:"clamp(8px,1.1vh,11px)", color:s.sub.color, opacity:0.75, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis", display:"none", "@media(min-width:500px)":{display:"block"} }}>
                  {s.sub.text}
                </div>
              </div>

              {/* RIGHT — compact CTA */}
              <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,1.2vw,12px)", flexShrink:0 }}>
                <div style={{ fontFamily:"'DM Sans',Arial,sans-serif", fontSize:"clamp(9px,1.1vh,11px)", color:s.cta.labelColor, fontWeight:600, whiteSpace:"nowrap", opacity:0.9 }}>
                  {s.cta.label}
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"clamp(6px,1vw,10px)", borderRadius:7, padding:"clamp(4px,0.8vh,6px) clamp(8px,1.2vw,12px)", background:s.cta.boxBg, border:`1px solid ${s.cta.boxBorder}` }}>
                  <div style={{ fontFamily:"'DM Serif Display',Georgia,serif", fontSize:"clamp(10px,1.5vh,14px)", color:s.cta.urlColor, whiteSpace:"nowrap", fontWeight:400 }}>
                    {s.cta.url}
                  </div>
                  <div style={{ width:"clamp(18px,2.5vh,24px)", height:"clamp(18px,2.5vh,24px)", borderRadius:"50%", background:s.cta.arrowBg, color:s.cta.arrowColor, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"clamp(10px,1.4vh,13px)", fontWeight:700, flexShrink:0 }}>→</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── progress bar ── */}
      <div style={{ position:"absolute",bottom:0,left:0,width:`${progress*100}%`,height:1.5,background:"rgba(255,255,255,0.35)",zIndex:10,pointerEvents:"none" }} />

      {/* ── dot indicators ── */}
      <div style={{ position:"absolute",bottom:5,right:"clamp(10px,2vw,20px)",display:"flex",gap:4,zIndex:10 }}>
        {AD_SLIDES.map((_,i) => (
          <div key={i} onClick={()=>jumpTo(i)}
            style={{ width:i===current?10:4,height:4,borderRadius:i===current?2:50,
              background:i===current?"rgba(255,255,255,0.8)":"rgba(255,255,255,0.25)",
              cursor:"pointer",transition:"all 0.3s" }} />
        ))}
      </div>

      {/* ── paused hint ── */}
      {paused && (
        <div style={{ position:"absolute",top:5,right:"clamp(10px,2vw,20px)",fontFamily:"'DM Sans',Arial",fontSize:"9px",letterSpacing:"1px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",zIndex:10 }}>
          ⏸
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   BASKET ITEM — swipe to delete on mobile, ✕ button on desktop, tick off
═══════════════════════════════════════════════════════════════════════════ */
function BasketItem({ item, overPay, onRemove, onAdd, onDelete }) {
  const [ticked,     setTicked]     = useState(false);
  const [swipeX,     setSwipeX]     = useState(0);
  const [swiping,    setSwiping]    = useState(false);
  const [deleted,    setDeleted]    = useState(false);
  const startX = useRef(0);
  const SWIPE_THRESHOLD = 80;

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setSwiping(true);
  };

  const handleTouchMove = (e) => {
    const dx = e.touches[0].clientX - startX.current;
    // Only allow left swipe (negative dx)
    if (dx < 0) setSwipeX(Math.max(dx, -120));
  };

  const handleTouchEnd = () => {
    setSwiping(false);
    if (swipeX < -SWIPE_THRESHOLD) {
      // Trigger delete animation
      setDeleted(true);
      setTimeout(onDelete, 300);
    } else {
      setSwipeX(0);
    }
  };

  if (deleted) return null;

  return (
    <div style={{ position:"relative", overflow:"hidden", borderRadius:12 }}>
      {/* Red delete background revealed on swipe */}
      <div style={{
        position:"absolute", right:0, top:0, bottom:0, width:120,
        background:"linear-gradient(135deg,#dc2626,#b91c1c)",
        display:"flex", alignItems:"center", justifyContent:"center",
        borderRadius:12, gap:6,
      }}>
        <span style={{ fontSize:18 }}>🗑️</span>
        <span style={{ fontSize:11, fontWeight:700, color:"white" }}>Remove</span>
      </div>

      {/* Main item row */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          display:"flex", alignItems:"center", justifyContent:"space-between",
          background: ticked ? "rgba(34,197,94,.08)" : "rgba(255,255,255,.04)",
          borderRadius:12, padding:"9px 13px",
          border: ticked ? "1px solid rgba(34,197,94,.2)" : "1px solid rgba(255,255,255,.07)",
          transform:`translateX(${swipeX}px)`,
          transition: swiping ? "none" : "transform .3s ease, background .2s, border .2s, opacity .3s",
          opacity: deleted ? 0 : 1,
          position:"relative", zIndex:1,
          userSelect:"none",
        }}
      >
        {/* Tick off button */}
        <button
          onClick={()=>setTicked(t=>!t)}
          title={ticked ? "Mark as not collected" : "Mark as collected"}
          style={{
            flexShrink:0, width:24, height:24, borderRadius:6,
            background: ticked ? "#16a34a" : "rgba(255,255,255,.08)",
            border: ticked ? "none" : "1px solid rgba(255,255,255,.15)",
            color:"white", cursor:"pointer", fontSize:12, fontWeight:700,
            display:"flex", alignItems:"center", justifyContent:"center",
            marginRight:8, transition:"all .2s",
          }}>
          {ticked ? "✓" : ""}
        </button>

        {/* Product info */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flex:1, minWidth:0 }}>
          <span style={{ fontSize:18, flexShrink:0, opacity: ticked ? 0.4 : 1, transition:"opacity .2s" }}>{item.product.icon}</span>
          <div style={{ minWidth:0 }}>
            <Tooltip text={item.product.name}>
              <div style={{ fontSize:11.5, fontWeight:600, color: ticked ? "#475569" : "#f0f4f8", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", textDecoration: ticked ? "line-through" : "none", transition:"all .2s" }}>
                {item.product.name}
              </div>
            </Tooltip>
            <div style={{ fontSize:9.5, color:"#475569" }}>
              {item.store?.emoji} {item.store?.name} · £{item.price.toFixed(2)}
              {overPay>0.01&&<span style={{ color:"#f87171", marginLeft:4 }}>(+£{overPay.toFixed(2)} vs cheapest)</span>}
            </div>
          </div>
        </div>

        {/* Quantity controls + price + delete */}
        <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5, background:"rgba(255,255,255,.06)", borderRadius:8, padding:"3px 7px" }}>
            <button onClick={onRemove} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:13, fontWeight:700, lineHeight:1 }}>−</button>
            <span style={{ fontSize:11, fontWeight:700, minWidth:13, textAlign:"center" }}>{item.qty}</span>
            <button onClick={onAdd} style={{ background:"none", border:"none", color:"#22c55e", cursor:"pointer", fontSize:13, fontWeight:700, lineHeight:1 }}>+</button>
          </div>
          <span style={{ fontSize:12.5, fontWeight:700, color: ticked ? "#475569" : "#f0f4f8", minWidth:46, textAlign:"right", textDecoration: ticked ? "line-through" : "none" }}>
            £{(item.price*item.qty).toFixed(2)}
          </span>
          {/* ✕ delete button — desktop */}
          <button
            onClick={()=>{ setDeleted(true); setTimeout(onDelete, 300); }}
            title="Remove item"
            style={{ background:"rgba(239,68,68,.12)", border:"1px solid rgba(239,68,68,.25)", borderRadius:6, width:22, height:22, color:"#ef4444", cursor:"pointer", fontSize:11, fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center", transition:"all .15s", flexShrink:0 }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(239,68,68,.3)"; e.currentTarget.style.borderColor="rgba(239,68,68,.5)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="rgba(239,68,68,.12)"; e.currentTarget.style.borderColor="rgba(239,68,68,.25)"; }}
          >✕</button>
        </div>
      </div>

      {/* Swipe hint — only shows briefly on first render on mobile */}
      {swipeX < -10 && (
        <div style={{ position:"absolute", bottom:4, right:10, fontSize:9, color:"rgba(255,255,255,.3)" }}>
          Keep swiping to remove
        </div>
      )}
    </div>
  );
}

function Chip({ active, onClick, color, children }) {
  const hexToRgb = (hex) => {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return {r,g,b};
  };
  const {r,g,b} = hexToRgb(color);
  const light = `rgb(${Math.min(255,r+40)},${Math.min(255,g+40)},${Math.min(255,b+40)})`;
  const dark  = `rgb(${Math.round(r*0.55)},${Math.round(g*0.55)},${Math.round(b*0.55)})`;
  const dim   = `rgb(${Math.round(r*0.25)},${Math.round(g*0.25)},${Math.round(b*0.25)})`;
  return (
    <button onClick={onClick} style={{
      whiteSpace:"nowrap", padding:"6px 13px", borderRadius:22, fontSize:11, fontWeight:700, cursor:"pointer",
      background: active
        ? `linear-gradient(180deg,${light} 0%,${dark} 100%)`
        : `linear-gradient(180deg,${dark} 0%,${dim} 100%)`,
      border: `1px solid rgba(${r},${g},${b},${active?0.7:0.35})`,
      color: active ? "#fff" : `rgba(${r+80},${g+80},${b+80},0.85)`,
      boxShadow: active
        ? `0 3px 10px rgba(${r},${g},${b},0.55), inset 0 1px 0 rgba(255,255,255,0.25)`
        : `0 2px 6px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.07)`,
      textShadow: "0 1px 2px rgba(0,0,0,0.35)",
      position:"relative", overflow:"hidden",
      opacity: active ? 1 : 0.75,
    }}>
      <span style={{ position:"absolute", top:0, left:0, right:0, height:"52%", background:"linear-gradient(180deg,rgba(255,255,255,0.28) 0%,rgba(255,255,255,0.04) 100%)", borderRadius:"22px 22px 0 0", pointerEvents:"none" }} />
      {children}
    </button>
  );
}

