// ==UserScript==
// @name         Ocean Client GUI by NoahLi DONE
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  Element Zapper/Hack/Mover/Color Changer
// @match        *://*/*
// @grant        none
// ==/UserScript==

//Copyright © @noahliNotFound 2025. All rights reserved.
(function() {
    'use strict';

    // ======= STYLE =======
    const style = document.createElement('style');
    style.textContent = `
        * {
            /* Remove forced dark blue background and white text */
            /* background-color: #000022 !important; */
            /* color: white !important; */
            /* Instead, add smooth transitions for all properties */
            transition: all 0.4s cubic-bezier(.4,2,.6,1);
        }
        html, body {
            /* Remove forced dark blue background */
            /* background-color: #000022 !important; */
            scroll-behavior: smooth;
        }
        /* Remove or adjust other color-forcing rules as needed */
        input, textarea, select {
            /* background-color: rgba(20, 20, 60, 0.85) !important; */
            /* color: white !important; */
            border: 1px solid #444 !important;
            border-radius: 6px !important;
            padding: 6px;
            transition: all 0.4s cubic-bezier(.4,2,.6,1);
        }
        a {
            /* color: #77ccff !important; */
            transition: color 0.4s cubic-bezier(.4,2,.6,1);
        }
        ::selection {
            background: #33f !important;
            color: #fff !important;
        }
        /* Keep UI elements dark if you want, or adjust as needed */
        .ocean-ui,
        #ocean-navbar,
        #ocean-gui,
        #element-highlight,
        #ocean-navbar-toggle {
            background: #23272e !important;
            color: #fff !important;
            transition: all 0.4s cubic-bezier(.4,2,.6,1);
        }
        #ocean-navbar {
            position: fixed;
            top: 10px;
            left: 10px;
            z-index: 9999;
            background: #23272e !important;
            backdrop-filter: blur(10px);
            padding: 10px 22px 10px 50px;
            border-radius: 14px;
            font-family: 'Segoe UI', sans-serif;
            font-size: 18px;
            color: #aaf;
            cursor: pointer;
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
            user-select: none;
            transition: background-color 0.3s, color 0.3s, left 0.4s cubic-bezier(.4,2,.6,1), opacity 0.4s;
            opacity: 1;
        }
        #ocean-navbar.hide {
            left: -300px;
            opacity: 0;
            pointer-events: none;
        }
        #ocean-navbar:hover {
            background: rgba(0, 0, 100, 0.95);
            color: #ccf;
        }
        #ocean-navbar-toggle {
            position: fixed;
            left: 10px;
            top: 10px;
            width: 36px;
            height: 36px;
            background: rgba(0,0,60,0.7);
            border: none;
            border-radius: 8px;
            color: #aaf;
            font-size: 26px;
            cursor: pointer;
            z-index: 10000;
            transition: background 0.3s, opacity 0.4s;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
        #ocean-navbar-toggle:hover {
            background: rgba(0,0,100,0.9);
        }

        #ocean-gui {
            display: none;
            position: fixed;
            top: 60px;
            left: 10px;
            z-index: 9999;
            background: #23272e !important;
            border: 2.5px solid #7ecbff;
            backdrop-filter: blur(22px);
            padding: 22px 28px 18px;
            border-radius: 18px;
            box-shadow: 0 0 18px rgba(0,0,0,0.6);
            color: #003366;
            font-family: 'Segoe UI', sans-serif;
            min-width: 240px;
            user-select: none;
            transition: opacity 0.4s, top 0.4s cubic-bezier(.4,2,.6,1);
            opacity: 0;
            pointer-events: none;
        }
        #ocean-gui.show {
            display: block;
            opacity: 1;
            pointer-events: auto;
            top: 60px;
        }
        #ocean-gui label {
            display: block;
            margin-bottom: 14px;
            font-size: 15px;
            cursor: pointer;
        }
        #ocean-close {
            background: #ff4444;
            color: white;
            border: none;
            border-radius: 8px;
            padding: 6px 12px;
            float: right;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.25s ease;
            user-select: none;
        }
        #ocean-close:hover {
            background: #ff2222;
        }
        #ocean-undo {
            background: #7ecbff;
            color: #003366;
            border: none;
            border-radius: 8px;
            padding: 6px 12px;
            margin-bottom: 10px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.25s;
            user-select: none;
        }
        #ocean-undo:hover {
            background: #4eb6ff;
        }
        input[type="checkbox"] {
            margin-right: 8px;
            width: 16px;
            height: 16px;
            cursor: pointer;
            vertical-align: middle;
        }

        /* Highlight box for element zapper */
        #element-highlight {
            position: fixed;
            pointer-events: none;
            border: 3px solid orange;
            z-index: 1000000;
            display: none;
            box-sizing: border-box;
            border-radius: 6px;
            transition: all 0.1s ease;
            background: rgba(33,150,243,0.08) !important;
        }

        /* Modal box (Element Hack) */
        .ocean-ui.hack-modal {
            background: #23272e !important;
            color: #fff !important;
        }
        /* Buttons */
        #ocean-close, #ocean-undo, #ocean-unzap-all, .ocean-hack-copy {
            background: #444 !important;
            color: #fff !important;
        }
        #ocean-close:hover, #ocean-undo:hover, #ocean-unzap-all:hover, .ocean-hack-copy:hover {
            background: #666 !important;
        }

        .ocean-mover-highlight {
            box-shadow: 0 0 0 3px #ff9800, 0 2px 8px rgba(0,0,0,0.2);
            border-radius: 6px !important;
            background: rgba(255,152,0,0.08) !important;
            transition: box-shadow 0.2s, background 0.2s;
        }
        .ocean-mover-hint {
            outline: 2.5px dashed #ff9800 !important;
            outline-offset: 2px !important;
            border-radius: 6px !important;
            transition: outline 0.2s;
        }

        #ocean-unzap-all, #ocean-clear-move {
            background: linear-gradient(90deg, #7ecbff 0%, #2196f3 100%) !important;
            color: #fff !important;
            border: none !important;
            border-radius: 8px !important;
            padding: 7px 18px !important;
            margin-bottom: 10px;
            margin-right: 8px;
            font-weight: bold;
            font-size: 15px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(33,150,243,0.12);
            transition: background 0.25s, box-shadow 0.25s, transform 0.15s;
        }
        #ocean-unzap-all:hover, #ocean-clear-move:hover {
            background: linear-gradient(90deg, #2196f3 0%, #7ecbff 100%) !important;
            box-shadow: 0 4px 16px rgba(33,150,243,0.18);
            transform: translateY(-2px) scale(1.04);
        }

        /* Global smooth transitions for all elements */
        * {
            transition: all 0.35s cubic-bezier(.4,2,.6,1) !important;
        }
        html, body {
            scroll-behavior: smooth;
        }
        /* Smoother popups and UI */
        .ocean-ui,
        #ocean-navbar,
        #ocean-gui,
        #element-highlight,
        #ocean-navbar-toggle,
        #ocean-unzap-all,
        #ocean-clear-move,
        .modal,
        .popup,
        .dialog,
        .alert,
        .ui-dialog {
            transition: all 0.35s cubic-bezier(.4,2,.6,1) !important;
        }
        /* Smoother highlight box */
        #element-highlight {
            transition: all 0.25s cubic-bezier(.4,2,.6,1) !important;
        }
        /* Smoother buttons */
        button, input, select, textarea {
            transition: all 0.25s cubic-bezier(.4,2,.6,1) !important;
        }
        /* Smoother hover for links */
        a, a:visited {
            transition: color 0.25s cubic-bezier(.4,2,.6,1) !important;
        }

        /* Modern, smooth style for all vanilla buttons - normal speed */
        button, input[type="button"], input[type="submit"] {
            background: linear-gradient(90deg, #6c757d 0%, #5a6268 100%);
            color: #fff;
            border: none;
            border-radius: 8px;
            padding: 8px 20px;
            font-size: 1rem;
            font-family: inherit;
            font-weight: 600;
            box-shadow: 0 2px 8px rgba(108,117,125,0.12);
            cursor: pointer;
            outline: none;
            transition:
                background 0.25s cubic-bezier(.25,.46,.45,.94),
                color 0.25s cubic-bezier(.25,.46,.45,.94),
                box-shadow 0.25s cubic-bezier(.25,.46,.45,.94),
                transform 0.25s cubic-bezier(.25,.46,.45,.94);
        }
        button:hover, input[type="button"]:hover, input[type="submit"]:hover {
            background: linear-gradient(90deg, #5a6268 0%, #6c757d 100%);
            box-shadow: 0 4px 16px rgba(108,117,125,0.18);
            transform: translateY(-2px) scale(1.02);
            color: #fff;
        }
        button:active, input[type="button"]:active, input[type="submit"]:active {
            background: #6c757d;
            transform: scale(0.98);
        }

        /* Enhanced smooth hover effects for all clickable elements */
        button, input[type="button"], input[type="submit"], a, [role="button"], label, .clickable,
        [onclick], [data-click], [data-action], [data-toggle], [data-target],
        .btn, .button, .link, .nav-link, .menu-item, .tab, .accordion-trigger,
        .dropdown-toggle, .modal-trigger, .tooltip-trigger, .popup-trigger {
            transition:
                all 0.8s cubic-bezier(.25,.46,.45,.94),
                transform 0.7s cubic-bezier(.25,.46,.45,.94),
                box-shadow 0.7s cubic-bezier(.25,.46,.45,.94),
                background-color 0.7s cubic-bezier(.25,.46,.45,.94),
                color 0.7s cubic-bezier(.25,.46,.45,.94),
                border-color 0.7s cubic-bezier(.25,.46,.45,.94),
                width 0.7s cubic-bezier(.25,.46,.45,.94),
                height 0.7s cubic-bezier(.25,.46,.45,.94),
                padding 0.7s cubic-bezier(.25,.46,.45,.94),
                margin 0.7s cubic-bezier(.25,.46,.45,.94);
            cursor: pointer;
            will-change: transform, box-shadow, background-color, color, width, height, padding, margin;
            position: relative;
            overflow: hidden;
            backface-visibility: hidden;
            transform-style: preserve-3d;
        }

        /* Smooth hover effects without blocky borders */
        button:hover, input[type="button"]:hover, input[type="submit"]:hover,
        a:hover, [role="button"]:hover, label:hover, .clickable:hover,
        [onclick]:hover, [data-click]:hover, [data-action]:hover, [data-toggle]:hover, [data-target]:hover,
        .btn:hover, .button:hover, .link:hover, .nav-link:hover, .menu-item:hover, .tab:hover, .accordion-trigger:hover,
        .dropdown-toggle:hover, .modal-trigger:hover, .tooltip-trigger:hover, .popup-trigger:hover {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 
                0 8px 25px rgba(0,0,0,0.12),
                0 4px 10px rgba(0,0,0,0.08);
            z-index: 10;
        }

        /* Smooth active/pressed effects */
        button:active, input[type="button"]:active, input[type="submit"]:active,
        a:active, [role="button"]:active, label:active, .clickable:active,
        [onclick]:active, [data-click]:active, [data-action]:active, [data-toggle]:active, [data-target]:active,
        .btn:active, .button:active, .link:active, .nav-link:active, .menu-item:active, .tab:active, .accordion-trigger:active,
        .dropdown-toggle:active, .modal-trigger:active, .tooltip-trigger:active, .popup-trigger:active {
            transform: translateY(0px) scale(0.98);
            box-shadow: 
                0 4px 12px rgba(0,0,0,0.15),
                0 2px 4px rgba(0,0,0,0.1);
            transition: all 0.4s cubic-bezier(.25,.46,.45,.94);
        }

        /* Smooth focus effects without harsh outlines */
        button:focus, input[type="button"]:focus, input[type="submit"]:focus,
        a:focus, [role="button"]:focus, label:focus, .clickable:focus,
        [onclick]:focus, [data-click]:focus, [data-action]:focus, [data-toggle]:focus, [data-target]:focus,
        .btn:focus, .button:focus, .link:focus, .nav-link:focus, .menu-item:focus, .tab:focus, .accordion-trigger:focus,
        .dropdown-toggle:focus, .modal-trigger:focus, .tooltip-trigger:focus, .popup-trigger:focus {
            outline: none;
            box-shadow: 
                0 0 0 3px rgba(33,150,243,0.15),
                0 8px 25px rgba(0,0,0,0.12),
                0 4px 10px rgba(0,0,0,0.08);
        }

        /* Smooth ripple effect without harsh borders */
        button::before, input[type="button"]::before, input[type="submit"]::before,
        a::before, [role="button"]::before, label::before, .clickable::before,
        [onclick]::before, [data-click]::before, [data-action]::before, [data-toggle]::before, [data-target]::before,
        .btn::before, .button::before, .link::before, .nav-link::before, .menu-item::before, .tab::before, .accordion-trigger::before,
        .dropdown-toggle::before, .modal-trigger::before, .tooltip-trigger::before, .popup-trigger::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.1) 60%, transparent 100%);
            transform: translate(-50%, -50%);
            transition: width 1s cubic-bezier(.25,.46,.45,.94), height 1s cubic-bezier(.25,.46,.45,.94), opacity 1s ease;
            opacity: 0;
            pointer-events: none;
            z-index: 1;
        }

        button:active::before, input[type="button"]:active::before, input[type="submit"]:active::before,
        a:active::before, [role="button"]:active::before, label:active::before, .clickable:active::before,
        [onclick]:active::before, [data-click]:active::before, [data-action]:active::before, [data-toggle]:active::before, [data-target]:active::before,
        .btn:active::before, .button:active::before, .link:active::before, .nav-link:active::before, .menu-item:active::before, .tab:active::before, .accordion-trigger:active::before,
        .dropdown-toggle:active::before, .modal-trigger:active::before, .tooltip-trigger:active::before, .popup-trigger:active::before {
            width: 300px;
            height: 300px;
            opacity: 1;
            transition: width 0.8s cubic-bezier(.25,.46,.45,.94), height 0.8s cubic-bezier(.25,.46,.45,.94), opacity 0.8s ease;
        }

        /* Smooth animations for different element types */
        
        /* Links - smooth underline animation */
        a:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 2px;
            transition: text-decoration-thickness 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Navigation items - smooth background animation */
        .nav-link:hover, .menu-item:hover, .tab:hover {
            background-color: rgba(33,150,243,0.1);
            border-radius: 6px;
            transition: background-color 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Buttons with existing backgrounds - smooth glow effect */
        .btn:hover, .button:hover {
            background-color: rgba(33,150,243,0.9);
            color: white;
            transition: background-color 0.7s cubic-bezier(.25,.46,.45,.94), color 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Form elements - smooth border animation */
        input[type="button"]:hover, input[type="submit"]:hover {
            border-color: #2196f3;
            background-color: rgba(33,150,243,0.1);
            transition: border-color 0.7s cubic-bezier(.25,.46,.45,.94), background-color 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Dropdown and modal triggers - smooth background animation */
        .dropdown-toggle:hover, .modal-trigger:hover {
            background-color: rgba(33,150,243,0.15);
            border-radius: 8px;
            transition: background-color 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Enhanced smooth transitions for all interactive states */
        button, input, select, textarea, a, [role="button"], label, .clickable {
            transition: 
                all 0.8s cubic-bezier(.25,.46,.45,.94),
                transform 0.7s cubic-bezier(.25,.46,.45,.94),
                box-shadow 0.7s cubic-bezier(.25,.46,.45,.94),
                width 0.7s cubic-bezier(.25,.46,.45,.94),
                height 0.7s cubic-bezier(.25,.46,.45,.94),
                padding 0.7s cubic-bezier(.25,.46,.45,.94),
                margin 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Prevent effects on disabled elements */
        button:disabled, input:disabled, [disabled] {
            transform: none !important;
            box-shadow: none !important;
            cursor: not-allowed !important;
            opacity: 0.6;
            transition: none !important;
        }

        /* Slower loading states */
        .loading, [data-loading="true"] {
            position: relative;
            overflow: hidden;
        }
        .loading::after, [data-loading="true"]::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: slowShimmer 3s cubic-bezier(.25,.46,.45,.94) infinite;
        }
        @keyframes slowShimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        /* Slower color transitions */
        * {
            transition: 
                color 0.7s cubic-bezier(.25,.46,.45,.94),
                background-color 0.7s cubic-bezier(.25,.46,.45,.94),
                border-color 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Enhanced slower form elements */
        input, textarea, select {
            transition: 
                all 0.8s cubic-bezier(.25,.46,.45,.94),
                border-color 0.7s cubic-bezier(.25,.46,.45,.94),
                box-shadow 0.7s cubic-bezier(.25,.46,.45,.94),
                width 0.7s cubic-bezier(.25,.46,.45,.94),
                height 0.7s cubic-bezier(.25,.46,.45,.94),
                padding 0.7s cubic-bezier(.25,.46,.45,.94);
        }
        input:focus, textarea:focus, select:focus {
            border-color: #2196f3;
            box-shadow: 0 0 0 3px rgba(33,150,243,0.15);
            transform: translateY(-1px);
            transition: all 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Slower transitions for all interactive elements */
        [tabindex], [onclick], [data-click], [data-action], [data-toggle], [data-target] {
            transition: all 0.8s cubic-bezier(.25,.46,.45,.94);
        }

        /* Slower micro-interactions */
        button:not(:disabled):hover, 
        input[type="button"]:not(:disabled):hover, 
        input[type="submit"]:not(:disabled):hover,
        a:not([disabled]):hover,
        [role="button"]:not([disabled]):hover,
        label:not([disabled]):hover,
        .clickable:not([disabled]):hover {
            filter: brightness(1.05) contrast(1.02);
            transition: filter 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Slower active state */
        button:not(:disabled):active, 
        input[type="button"]:not(:disabled):active, 
        input[type="submit"]:not(:disabled):active,
        a:not([disabled]):active,
        [role="button"]:not([disabled]):active,
        label:not([disabled]):active,
        .clickable:not([disabled]):active {
            filter: brightness(0.95) contrast(1.05);
            transition: filter 0.4s cubic-bezier(.25,.46,.45,.94);
        }

        /* Remove any harsh borders or outlines */
        button, input, textarea, select, a, [role="button"], label, .clickable {
            outline: none;
            border: none;
        }

        /* Ensure smooth scaling without pixel snapping */
        button, input, textarea, select, a, [role="button"], label, .clickable {
            transform-origin: center center;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Slower size changes for all elements */
        * {
            transition: 
                width 0.7s cubic-bezier(.25,.46,.45,.94),
                height 0.7s cubic-bezier(.25,.46,.45,.94),
                padding 0.7s cubic-bezier(.25,.46,.45,.94),
                margin 0.7s cubic-bezier(.25,.46,.45,.94),
                font-size 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Slower global transitions */
        .ocean-ui,
        #ocean-navbar,
        #ocean-gui,
        #element-highlight,
        #ocean-navbar-toggle,
        #ocean-unzap-all,
        #ocean-clear-move,
        .modal,
        .popup,
        .dialog,
        .alert,
        .ui-dialog {
            transition: all 0.8s cubic-bezier(.25,.46,.45,.94) !important;
        }

        /* Slower highlight box */
        #element-highlight {
            transition: all 0.7s cubic-bezier(.25,.46,.45,.94) !important;
        }

        /* Slower buttons */
        button, input, select, textarea {
            transition: all 0.7s cubic-bezier(.25,.46,.45,.94) !important;
        }

        /* Slower hover for links */
        a, a:visited {
            transition: color 0.7s cubic-bezier(.25,.46,.45,.94) !important;
        }

        /* Enhanced bouncy animations for different element types */
        
        /* Links - bouncy underline animation */
        a:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 2px;
            animation: bouncyUnderline 0.6s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyUnderline {
            0% { text-decoration-thickness: 0px; }
            50% { text-decoration-thickness: 3px; }
            100% { text-decoration-thickness: 2px; }
        }

        /* Navigation items - bouncy background animation */
        .nav-link:hover, .menu-item:hover, .tab:hover {
            background-color: rgba(33,150,243,0.1);
            border-radius: 6px;
            animation: bouncyNavGlow 0.8s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyNavGlow {
            0% { background-color: rgba(33,150,243,0.05); }
            25% { background-color: rgba(33,150,243,0.2); }
            50% { background-color: rgba(33,150,243,0.15); }
            75% { background-color: rgba(33,150,243,0.18); }
            100% { background-color: rgba(33,150,243,0.1); }
        }

        /* Buttons with existing backgrounds - bouncy glow effect */
        .btn:hover, .button:hover {
            background-color: rgba(33,150,243,0.9);
            color: white;
            animation: bouncyButtonGlow 0.8s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyButtonGlow {
            0% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 0 rgba(33,150,243,0.4); }
            25% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 8px rgba(33,150,243,0.3); }
            50% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 12px rgba(33,150,243,0.2); }
            75% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 6px rgba(33,150,243,0.25); }
            100% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 0 rgba(33,150,243,0); }
        }

        /* Form elements - bouncy border animation */
        input[type="button"]:hover, input[type="submit"]:hover {
            border-color: #2196f3;
            background-color: rgba(33,150,243,0.1);
            animation: bouncyInputBorder 0.6s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyInputBorder {
            0% { border-color: rgba(33,150,243,0.5); }
            50% { border-color: rgba(33,150,243,0.8); }
            100% { border-color: #2196f3; }
        }

        /* Dropdown and modal triggers - bouncy background animation */
        .dropdown-toggle:hover, .modal-trigger:hover {
            background-color: rgba(33,150,243,0.15);
            border-radius: 8px;
            animation: bouncyDropdownGlow 0.8s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyDropdownGlow {
            0% { background-color: rgba(33,150,243,0.05); }
            25% { background-color: rgba(33,150,243,0.25); }
            50% { background-color: rgba(33,150,243,0.2); }
            75% { background-color: rgba(33,150,243,0.22); }
            100% { background-color: rgba(33,150,243,0.15); }
        }

        /* Enhanced bouncy transitions for all interactive states */
        button, input, select, textarea, a, [role="button"], label, .clickable {
            transition: 
                all 0.4s cubic-bezier(.68,-0.55,.265,1.55),
                transform 0.3s cubic-bezier(.68,-0.55,.265,1.55),
                box-shadow 0.3s cubic-bezier(.68,-0.55,.265,1.55);
        }

        /* Prevent bouncy effects on disabled elements */
        button:disabled, input:disabled, [disabled] {
            transform: none !important;
            box-shadow: none !important;
            cursor: not-allowed !important;
            opacity: 0.6;
            animation: none !important;
        }

        /* Enhanced bouncy loading states */
        .loading, [data-loading="true"] {
            position: relative;
            overflow: hidden;
        }
        .loading::after, [data-loading="true"]::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: bouncyShimmer 2s cubic-bezier(.68,-0.55,.265,1.55) infinite;
        }
        @keyframes bouncyShimmer {
            0% { left: -100%; }
            50% { left: 0%; }
            100% { left: 100%; }
        }

        /* Enhanced bouncy color transitions */
        * {
            transition: 
                color 0.3s cubic-bezier(.68,-0.55,.265,1.55),
                background-color 0.3s cubic-bezier(.68,-0.55,.265,1.55),
                border-color 0.3s cubic-bezier(.68,-0.55,.265,1.55);
        }

        /* Enhanced bouncy form elements */
        input, textarea, select {
            transition: 
                all 0.4s cubic-bezier(.68,-0.55,.265,1.55),
                border-color 0.3s cubic-bezier(.68,-0.55,.265,1.55),
                box-shadow 0.3s cubic-bezier(.68,-0.55,.265,1.55);
        }
        input:focus, textarea:focus, select:focus {
            border-color: #2196f3;
            box-shadow: 0 0 0 3px rgba(33,150,243,0.2);
            transform: translateY(-2px);
            animation: bouncyInputFocus 0.6s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyInputFocus {
            0% { 
                transform: translateY(-2px);
                box-shadow: 0 0 0 0 rgba(33,150,243,0.4);
            }
            25% { 
                transform: translateY(-3px);
                box-shadow: 0 0 0 6px rgba(33,150,243,0.3);
            }
            50% { 
                transform: translateY(-2px);
                box-shadow: 0 0 0 8px rgba(33,150,243,0.2);
            }
            75% { 
                transform: translateY(-3px);
                box-shadow: 0 0 0 4px rgba(33,150,243,0.25);
            }
            100% { 
                transform: translateY(-2px);
                box-shadow: 0 0 0 3px rgba(33,150,243,0.2);
            }
        }

        /* Bouncy transitions for all interactive elements */
        [tabindex], [onclick], [data-click], [data-action], [data-toggle], [data-target] {
            transition: all 0.4s cubic-bezier(.68,-0.55,.265,1.55);
        }

        /* Enhanced bouncy micro-interactions */
        button:not(:disabled):hover, 
        input[type="button"]:not(:disabled):hover, 
        input[type="submit"]:not(:disabled):hover,
        a:not([disabled]):hover,
        [role="button"]:not([disabled]):hover,
        label:not([disabled]):hover,
        .clickable:not([disabled]):hover {
            filter: brightness(1.1) contrast(1.05);
            animation: bouncyBrightness 0.6s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyBrightness {
            0% { filter: brightness(1.05) contrast(1.02); }
            50% { filter: brightness(1.15) contrast(1.08); }
            100% { filter: brightness(1.1) contrast(1.05); }
        }

        /* Enhanced bouncy active state */
        button:not(:disabled):active, 
        input[type="button"]:not(:disabled):active, 
        input[type="submit"]:not(:disabled):active,
        a:not([disabled]):active,
        [role="button"]:not([disabled]):active,
        label:not([disabled]):active,
        .clickable:not([disabled]):active {
            filter: brightness(0.9) contrast(1.1);
            animation: bouncyActive 0.3s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyActive {
            0% { filter: brightness(0.95) contrast(1.05); }
            50% { filter: brightness(0.85) contrast(1.15); }
            100% { filter: brightness(0.9) contrast(1.1); }
        }

        /* Enhanced ripple effect for all clickable elements */
        button::before, input[type="button"]::before, input[type="submit"]::before,
        a::before, [role="button"]::before, label::before, .clickable::before,
        [onclick]::before, [data-click]::before, [data-action]::before, [data-toggle]::before, [data-target]::before,
        .btn::before, .button::before, .link::before, .nav-link::before, .menu-item::before, .tab::before, .accordion-trigger::before,
        .dropdown-toggle::before, .modal-trigger::before, .tooltip-trigger::before, .popup-trigger::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 70%, transparent 100%);
            transform: translate(-50%, -50%);
            transition: width 0.6s cubic-bezier(.4,0,.2,1), height 0.6s cubic-bezier(.4,0,.2,1), opacity 0.6s ease;
            opacity: 0;
            pointer-events: none;
            z-index: 1;
        }

        button:active::before, input[type="button"]:active::before, input[type="submit"]:active::before,
        a:active::before, [role="button"]:active::before, label:active::before, .clickable:active::before,
        [onclick]:active::before, [data-click]:active::before, [data-action]:active::before, [data-toggle]:active::before, [data-target]:active::before,
        .btn:active::before, .button:active::before, .link:active::before, .nav-link:active::before, .menu-item:active::before, .tab:active::before, .accordion-trigger:active::before,
        .dropdown-toggle:active::before, .modal-trigger:active::before, .tooltip-trigger:active::before, .popup-trigger:active::before {
            width: 300px;
            height: 300px;
            opacity: 1;
            animation: rippleExpand 0.6s cubic-bezier(.4,0,.2,1);
        }

        /* Keyframe animations for enhanced effects */
        @keyframes buttonPulse {
            0% { transform: translateY(-3px) scale(1.03); }
            50% { transform: translateY(-3px) scale(1.05); }
            100% { transform: translateY(-3px) scale(1.03); }
        }

        @keyframes buttonPress {
            0% { transform: translateY(-1px) scale(0.97); }
            50% { transform: translateY(-1px) scale(0.95); }
            100% { transform: translateY(-1px) scale(0.97); }
        }

        @keyframes focusGlow {
            0% { box-shadow: 0 0 0 0 rgba(33,150,243,0.4), 0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1); }
            70% { box-shadow: 0 0 0 10px rgba(33,150,243,0), 0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1); }
            100% { box-shadow: 0 0 0 0 rgba(33,150,243,0), 0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1); }
        }

        @keyframes rippleExpand {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0;
            }
        }

        /* Enhanced hover animations for different element types */
        
        /* Links - enhanced underline animation */
        a:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 2px;
            animation: linkUnderline 0.3s ease-out;
        }

        @keyframes linkUnderline {
            0% { text-decoration-thickness: 0px; }
            100% { text-decoration-thickness: 2px; }
        }

        /* Navigation items - enhanced background animation */
        .nav-link:hover, .menu-item:hover, .tab:hover {
            background-color: rgba(33,150,243,0.1);
            border-radius: 6px;
            animation: navGlow 0.4s ease-out;
        }

        @keyframes navGlow {
            0% { background-color: rgba(33,150,243,0.05); }
            50% { background-color: rgba(33,150,243,0.15); }
            100% { background-color: rgba(33,150,243,0.1); }
        }

        /* Buttons with existing backgrounds - enhanced glow effect */
        .btn:hover, .button:hover {
            background-color: rgba(33,150,243,0.9);
            color: white;
            animation: buttonGlow 0.4s ease-out;
        }

        @keyframes buttonGlow {
            0% { box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 0 rgba(33,150,243,0.4); }
            70% { box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 10px rgba(33,150,243,0); }
            100% { box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 0 rgba(33,150,243,0); }
        }

        /* Form elements - enhanced border animation */
        input[type="button"]:hover, input[type="submit"]:hover {
            border-color: #2196f3;
            background-color: rgba(33,150,243,0.1);
            animation: inputBorderGlow 0.3s ease-out;
        }

        @keyframes inputBorderGlow {
            0% { border-color: rgba(33,150,243,0.5); }
            100% { border-color: #2196f3; }
        }

        /* Dropdown and modal triggers - enhanced background animation */
        .dropdown-toggle:hover, .modal-trigger:hover {
            background-color: rgba(33,150,243,0.15);
            border-radius: 8px;
            animation: dropdownGlow 0.4s ease-out;
        }

        @keyframes dropdownGlow {
            0% { background-color: rgba(33,150,243,0.05); }
            50% { background-color: rgba(33,150,243,0.2); }
            100% { background-color: rgba(33,150,243,0.15); }
        }

        /* Enhanced smooth transitions for all interactive states */
        button, input, select, textarea, a, [role="button"], label, .clickable {
            transition: 
                all 0.15s cubic-bezier(.34,1.56,.64,1),
                transform 0.12s cubic-bezier(.34,1.56,.64,1),
                box-shadow 0.12s cubic-bezier(.34,1.56,.64,1);
        }

        /* Prevent hover effects on disabled elements */
        button:disabled, input:disabled, [disabled] {
            transform: none !important;
            box-shadow: none !important;
            cursor: not-allowed !important;
            opacity: 0.6;
            animation: none !important;
        }

        /* Enhanced loading states with shimmer effect */
        .loading, [data-loading="true"] {
            position: relative;
            overflow: hidden;
        }
        .loading::after, [data-loading="true"]::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        /* Enhanced smooth color transitions for text and backgrounds */
        * {
            transition: 
                color 0.2s cubic-bezier(.34,1.56,.64,1),
                background-color 0.2s cubic-bezier(.34,1.56,.64,1),
                border-color 0.2s cubic-bezier(.34,1.56,.64,1);
        }

        /* Enhanced smoothness for form elements */
        input, textarea, select {
            transition: 
                all 0.25s cubic-bezier(.34,1.56,.64,1),
                border-color 0.2s cubic-bezier(.34,1.56,.64,1),
                box-shadow 0.2s cubic-bezier(.34,1.56,.64,1);
        }
        input:focus, textarea:focus, select:focus {
            border-color: #2196f3;
            box-shadow: 0 0 0 3px rgba(33,150,243,0.2);
            transform: translateY(-1px);
            animation: inputFocusGlow 0.3s ease-out;
        }

        @keyframes inputFocusGlow {
            0% { box-shadow: 0 0 0 0 rgba(33,150,243,0.4); }
            70% { box-shadow: 0 0 0 6px rgba(33,150,243,0); }
            100% { box-shadow: 0 0 0 3px rgba(33,150,243,0.2); }
        }

        /* Smooth transitions for all interactive elements */
        [tabindex], [onclick], [data-click], [data-action], [data-toggle], [data-target] {
            transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
        }

        /* Enhanced micro-interactions for better UX */
        button:not(:disabled):hover, 
        input[type="button"]:not(:disabled):hover, 
        input[type="submit"]:not(:disabled):hover,
        a:not([disabled]):hover,
        [role="button"]:not([disabled]):hover,
        label:not([disabled]):hover,
        .clickable:not([disabled]):hover {
            filter: brightness(1.05) contrast(1.02);
        }

        /* Enhanced active state with subtle scale and shadow */
        button:not(:disabled):active, 
        input[type="button"]:not(:disabled):active, 
        input[type="submit"]:not(:disabled):active,
        a:not([disabled]):active,
        [role="button"]:not([disabled]):active,
        label:not([disabled]):active,
        .clickable:not([disabled]):active {
            filter: brightness(0.95) contrast(1.05);
        }

        /* Remove any harsh borders or outlines */
        button, input, textarea, select, a, [role="button"], label, .clickable {
            outline: none;
            border: none;
        }

        /* Ensure smooth scaling without pixel snapping */
        button, input, textarea, select, a, [role="button"], label, .clickable {
            transform-origin: center center;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        /* Slower size changes for all elements */
        * {
            transition: 
                width 0.7s cubic-bezier(.25,.46,.45,.94),
                height 0.7s cubic-bezier(.25,.46,.45,.94),
                padding 0.7s cubic-bezier(.25,.46,.45,.94),
                margin 0.7s cubic-bezier(.25,.46,.45,.94),
                font-size 0.7s cubic-bezier(.25,.46,.45,.94);
        }

        /* Slower global transitions */
        .ocean-ui,
        #ocean-navbar,
        #ocean-gui,
        #element-highlight,
        #ocean-navbar-toggle,
        #ocean-unzap-all,
        #ocean-clear-move,
        .modal,
        .popup,
        .dialog,
        .alert,
        .ui-dialog {
            transition: all 0.8s cubic-bezier(.25,.46,.45,.94) !important;
        }

        /* Slower highlight box */
        #element-highlight {
            transition: all 0.7s cubic-bezier(.25,.46,.45,.94) !important;
        }

        /* Slower buttons */
        button, input, select, textarea {
            transition: all 0.7s cubic-bezier(.25,.46,.45,.94) !important;
        }

        /* Slower hover for links */
        a, a:visited {
            transition: color 0.7s cubic-bezier(.25,.46,.45,.94) !important;
        }

        /* Enhanced bouncy animations for different element types */
        
        /* Links - bouncy underline animation */
        a:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 2px;
            animation: bouncyUnderline 0.6s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyUnderline {
            0% { text-decoration-thickness: 0px; }
            50% { text-decoration-thickness: 3px; }
            100% { text-decoration-thickness: 2px; }
        }

        /* Navigation items - bouncy background animation */
        .nav-link:hover, .menu-item:hover, .tab:hover {
            background-color: rgba(33,150,243,0.1);
            border-radius: 6px;
            animation: bouncyNavGlow 0.8s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyNavGlow {
            0% { background-color: rgba(33,150,243,0.05); }
            25% { background-color: rgba(33,150,243,0.2); }
            50% { background-color: rgba(33,150,243,0.15); }
            75% { background-color: rgba(33,150,243,0.18); }
            100% { background-color: rgba(33,150,243,0.1); }
        }

        /* Buttons with existing backgrounds - bouncy glow effect */
        .btn:hover, .button:hover {
            background-color: rgba(33,150,243,0.9);
            color: white;
            animation: bouncyButtonGlow 0.8s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyButtonGlow {
            0% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 0 rgba(33,150,243,0.4); }
            25% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 8px rgba(33,150,243,0.3); }
            50% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 12px rgba(33,150,243,0.2); }
            75% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 6px rgba(33,150,243,0.25); }
            100% { box-shadow: 0 12px 30px rgba(0,0,0,0.2), 0 0 0 0 rgba(33,150,243,0); }
        }

        /* Form elements - bouncy border animation */
        input[type="button"]:hover, input[type="submit"]:hover {
            border-color: #2196f3;
            background-color: rgba(33,150,243,0.1);
            animation: bouncyInputBorder 0.6s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyInputBorder {
            0% { border-color: rgba(33,150,243,0.5); }
            50% { border-color: rgba(33,150,243,0.8); }
            100% { border-color: #2196f3; }
        }

        /* Dropdown and modal triggers - bouncy background animation */
        .dropdown-toggle:hover, .modal-trigger:hover {
            background-color: rgba(33,150,243,0.15);
            border-radius: 8px;
            animation: bouncyDropdownGlow 0.8s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyDropdownGlow {
            0% { background-color: rgba(33,150,243,0.05); }
            25% { background-color: rgba(33,150,243,0.25); }
            50% { background-color: rgba(33,150,243,0.2); }
            75% { background-color: rgba(33,150,243,0.22); }
            100% { background-color: rgba(33,150,243,0.15); }
        }

        /* Enhanced bouncy transitions for all interactive states */
        button, input, select, textarea, a, [role="button"], label, .clickable {
            transition: 
                all 0.4s cubic-bezier(.68,-0.55,.265,1.55),
                transform 0.3s cubic-bezier(.68,-0.55,.265,1.55),
                box-shadow 0.3s cubic-bezier(.68,-0.55,.265,1.55);
        }

        /* Prevent bouncy effects on disabled elements */
        button:disabled, input:disabled, [disabled] {
            transform: none !important;
            box-shadow: none !important;
            cursor: not-allowed !important;
            opacity: 0.6;
            animation: none !important;
        }

        /* Enhanced bouncy loading states */
        .loading, [data-loading="true"] {
            position: relative;
            overflow: hidden;
        }
        .loading::after, [data-loading="true"]::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: bouncyShimmer 2s cubic-bezier(.68,-0.55,.265,1.55) infinite;
        }
        @keyframes bouncyShimmer {
            0% { left: -100%; }
            50% { left: 0%; }
            100% { left: 100%; }
        }

        /* Enhanced bouncy color transitions */
        * {
            transition: 
                color 0.3s cubic-bezier(.68,-0.55,.265,1.55),
                background-color 0.3s cubic-bezier(.68,-0.55,.265,1.55),
                border-color 0.3s cubic-bezier(.68,-0.55,.265,1.55);
        }

        /* Enhanced bouncy form elements */
        input, textarea, select {
            transition: 
                all 0.4s cubic-bezier(.68,-0.55,.265,1.55),
                border-color 0.3s cubic-bezier(.68,-0.55,.265,1.55),
                box-shadow 0.3s cubic-bezier(.68,-0.55,.265,1.55);
        }
        input:focus, textarea:focus, select:focus {
            border-color: #2196f3;
            box-shadow: 0 0 0 3px rgba(33,150,243,0.2);
            transform: translateY(-2px);
            animation: bouncyInputFocus 0.6s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyInputFocus {
            0% { 
                transform: translateY(-2px);
                box-shadow: 0 0 0 0 rgba(33,150,243,0.4);
            }
            25% { 
                transform: translateY(-3px);
                box-shadow: 0 0 0 6px rgba(33,150,243,0.3);
            }
            50% { 
                transform: translateY(-2px);
                box-shadow: 0 0 0 8px rgba(33,150,243,0.2);
            }
            75% { 
                transform: translateY(-3px);
                box-shadow: 0 0 0 4px rgba(33,150,243,0.25);
            }
            100% { 
                transform: translateY(-2px);
                box-shadow: 0 0 0 3px rgba(33,150,243,0.2);
            }
        }

        /* Bouncy transitions for all interactive elements */
        [tabindex], [onclick], [data-click], [data-action], [data-toggle], [data-target] {
            transition: all 0.4s cubic-bezier(.68,-0.55,.265,1.55);
        }

        /* Enhanced bouncy micro-interactions */
        button:not(:disabled):hover, 
        input[type="button"]:not(:disabled):hover, 
        input[type="submit"]:not(:disabled):hover,
        a:not([disabled]):hover,
        [role="button"]:not([disabled]):hover,
        label:not([disabled]):hover,
        .clickable:not([disabled]):hover {
            filter: brightness(1.1) contrast(1.05);
            animation: bouncyBrightness 0.6s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyBrightness {
            0% { filter: brightness(1.05) contrast(1.02); }
            50% { filter: brightness(1.15) contrast(1.08); }
            100% { filter: brightness(1.1) contrast(1.05); }
        }

        /* Enhanced bouncy active state */
        button:not(:disabled):active, 
        input[type="button"]:not(:disabled):active, 
        input[type="submit"]:not(:disabled):active,
        a:not([disabled]):active,
        [role="button"]:not([disabled]):active,
        label:not([disabled]):active,
        .clickable:not([disabled]):active {
            filter: brightness(0.9) contrast(1.1);
            animation: bouncyActive 0.3s cubic-bezier(.68,-0.55,.265,1.55);
        }

        @keyframes bouncyActive {
            0% { filter: brightness(0.95) contrast(1.05); }
            50% { filter: brightness(0.85) contrast(1.15); }
            100% { filter: brightness(0.9) contrast(1.1); }
        }

        /* Enhanced ripple effect for all clickable elements */
        button::before, input[type="button"]::before, input[type="submit"]::before,
        a::before, [role="button"]::before, label::before, .clickable::before,
        [onclick]::before, [data-click]::before, [data-action]::before, [data-toggle]::before, [data-target]::before,
        .btn::before, .button::before, .link::before, .nav-link::before, .menu-item::before, .tab::before, .accordion-trigger::before,
        .dropdown-toggle::before, .modal-trigger::before, .tooltip-trigger::before, .popup-trigger::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: 0;
            height: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 70%, transparent 100%);
            transform: translate(-50%, -50%);
            transition: width 0.6s cubic-bezier(.4,0,.2,1), height 0.6s cubic-bezier(.4,0,.2,1), opacity 0.6s ease;
            opacity: 0;
            pointer-events: none;
            z-index: 1;
        }

        button:active::before, input[type="button"]:active::before, input[type="submit"]:active::before,
        a:active::before, [role="button"]:active::before, label:active::before, .clickable:active::before,
        [onclick]:active::before, [data-click]:active::before, [data-action]:active::before, [data-toggle]:active::before, [data-target]:active::before,
        .btn:active::before, .button:active::before, .link:active::before, .nav-link:active::before, .menu-item:active::before, .tab:active::before, .accordion-trigger:active::before,
        .dropdown-toggle:active::before, .modal-trigger:active::before, .tooltip-trigger:active::before, .popup-trigger:active::before {
            width: 300px;
            height: 300px;
            opacity: 1;
            animation: rippleExpand 0.6s cubic-bezier(.4,0,.2,1);
        }

        /* Keyframe animations for enhanced effects */
        @keyframes buttonPulse {
            0% { transform: translateY(-3px) scale(1.03); }
            50% { transform: translateY(-3px) scale(1.05); }
            100% { transform: translateY(-3px) scale(1.03); }
        }

        @keyframes buttonPress {
            0% { transform: translateY(-1px) scale(0.97); }
            50% { transform: translateY(-1px) scale(0.95); }
            100% { transform: translateY(-1px) scale(0.97); }
        }

        @keyframes focusGlow {
            0% { box-shadow: 0 0 0 0 rgba(33,150,243,0.4), 0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1); }
            70% { box-shadow: 0 0 0 10px rgba(33,150,243,0), 0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1); }
            100% { box-shadow: 0 0 0 0 rgba(33,150,243,0), 0 8px 25px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.1); }
        }

        @keyframes rippleExpand {
            0% {
                transform: translate(-50%, -50%) scale(0);
                opacity: 1;
            }
            100% {
                transform: translate(-50%, -50%) scale(1);
                opacity: 0;
            }
        }

        /* Enhanced hover animations for different element types */
        
        /* Links - enhanced underline animation */
        a:hover {
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 2px;
            animation: linkUnderline 0.3s ease-out;
        }

        @keyframes linkUnderline {
            0% { text-decoration-thickness: 0px; }
            100% { text-decoration-thickness: 2px; }
        }

        /* Navigation items - enhanced background animation */
        .nav-link:hover, .menu-item:hover, .tab:hover {
            background-color: rgba(33,150,243,0.1);
            border-radius: 6px;
            animation: navGlow 0.4s ease-out;
        }

        @keyframes navGlow {
            0% { background-color: rgba(33,150,243,0.05); }
            50% { background-color: rgba(33,150,243,0.15); }
            100% { background-color: rgba(33,150,243,0.1); }
        }

        /* Buttons with existing backgrounds - enhanced glow effect */
        .btn:hover, .button:hover {
            background-color: rgba(33,150,243,0.9);
            color: white;
            animation: buttonGlow 0.4s ease-out;
        }

        @keyframes buttonGlow {
            0% { box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 0 rgba(33,150,243,0.4); }
            70% { box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 10px rgba(33,150,243,0); }
            100% { box-shadow: 0 4px 12px rgba(0,0,0,0.15), 0 0 0 0 rgba(33,150,243,0); }
        }

        /* Form elements - enhanced border animation */
        input[type="button"]:hover, input[type="submit"]:hover {
            border-color: #2196f3;
            background-color: rgba(33,150,243,0.1);
            animation: inputBorderGlow 0.3s ease-out;
        }

        @keyframes inputBorderGlow {
            0% { border-color: rgba(33,150,243,0.5); }
            100% { border-color: #2196f3; }
        }

        /* Dropdown and modal triggers - enhanced background animation */
        .dropdown-toggle:hover, .modal-trigger:hover {
            background-color: rgba(33,150,243,0.15);
            border-radius: 8px;
            animation: dropdownGlow 0.4s ease-out;
        }

        @keyframes dropdownGlow {
            0% { background-color: rgba(33,150,243,0.05); }
            50% { background-color: rgba(33,150,243,0.2); }
            100% { background-color: rgba(33,150,243,0.15); }
        }

        /* Enhanced smooth transitions for all interactive states */
        button, input, select, textarea, a, [role="button"], label, .clickable {
            transition: 
                all 0.25s cubic-bezier(.34,1.56,.64,1),
                transform 0.2s cubic-bezier(.34,1.56,.64,1),
                box-shadow 0.2s cubic-bezier(.34,1.56,.64,1);
        }

        /* Prevent hover effects on disabled elements */
        button:disabled, input:disabled, [disabled] {
            transform: none !important;
            box-shadow: none !important;
            cursor: not-allowed !important;
            opacity: 0.6;
            animation: none !important;
        }

        /* Enhanced loading states with shimmer effect */
        .loading, [data-loading="true"] {
            position: relative;
            overflow: hidden;
        }
        .loading::after, [data-loading="true"]::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
        }

        /* Enhanced smooth color transitions for text and backgrounds */
        * {
            transition: 
                color 0.2s cubic-bezier(.34,1.56,.64,1),
                background-color 0.2s cubic-bezier(.34,1.56,.64,1),
                border-color 0.2s cubic-bezier(.34,1.56,.64,1);
        }

        /* Enhanced smoothness for form elements */
        input, textarea, select {
            transition: 
                all 0.25s cubic-bezier(.34,1.56,.64,1),
                border-color 0.2s cubic-bezier(.34,1.56,.64,1),
                box-shadow 0.2s cubic-bezier(.34,1.56,.64,1);
        }
        input:focus, textarea:focus, select:focus {
            border-color: #2196f3;
            box-shadow: 0 0 0 3px rgba(33,150,243,0.2);
            transform: translateY(-1px);
            animation: inputFocusGlow 0.3s ease-out;
        }

        @keyframes inputFocusGlow {
            0% { box-shadow: 0 0 0 0 rgba(33,150,243,0.4); }
            70% { box-shadow: 0 0 0 6px rgba(33,150,243,0); }
            100% { box-shadow: 0 0 0 3px rgba(33,150,243,0.2); }
        }

        /* Smooth transitions for all interactive elements */
        [tabindex], [onclick], [data-click], [data-action], [data-toggle], [data-target] {
            transition: all 0.25s cubic-bezier(.34,1.56,.64,1);
        }

        /* Enhanced micro-interactions for better UX */
        button:not(:disabled):hover, 
        input[type="button"]:not(:disabled):hover, 
        input[type="submit"]:not(:disabled):hover,
        a:not([disabled]):hover,
        [role="button"]:not([disabled]):hover,
        label:not([disabled]):hover,
        .clickable:not([disabled]):hover {
            filter: brightness(1.05) contrast(1.02);
        }

        /* Enhanced active state with subtle scale and shadow */
        button:not(:disabled):active, 
        input[type="button"]:not(:disabled):active, 
        input[type="submit"]:not(:disabled):active,
        a:not([disabled]):active,
        [role="button"]:not([disabled]):active,
        label:not([disabled]):active,
        .clickable:not([disabled]):active {
            filter: brightness(0.95) contrast(1.05);
        }
    `;
    document.head.appendChild(style);

    // ======= CREATE UI ELEMENTS =======
    // Hamburger button OUTSIDE the navbar
    const hamburger = document.createElement('button');
    hamburger.id = 'ocean-navbar-toggle';
    hamburger.title = 'Toggle Navbar';
    hamburger.innerHTML = '∥';
    document.body.appendChild(hamburger);

    const nav = document.createElement('div');
    nav.id = 'ocean-navbar';
    nav.innerHTML = `<span style="margin-left: 10px;">🌊 Ocean Client by @noahliNotFound (YT channel)</span>`;
    document.body.appendChild(nav);

    const gui = document.createElement('div');
    gui.id = 'ocean-gui';
    gui.innerHTML = `
        <div id="ocean-gui-stack" style="display: flex; flex-direction: column; gap: 10px;">
            <button id="ocean-close" title="Close">X</button>
            <button id="ocean-undo" title="Undo Last Zap">Undo Last Zap</button>
            <button id="ocean-unzap-all" title="Remove All Zaps">Remove All Zaps</button>
            <label><input type="checkbox" id="zapperToggle"> Element Zapper</label>
            <label><input type="checkbox" id="elementHackToggle"> Element Hack</label>
            <label><input type="checkbox" id="elementMoverToggle"> Element Mover</label>
            <button id="ocean-clear-move" title="Clear All Move">Clear All Move</button>
            <label><input type="checkbox" id="elementSizeChangerToggle"> Element Size Changer</label>
            <button id="ocean-remove-size" title="Remove All Changed Size">Clear Changed Size</button>
            <label><input type="checkbox" id="elementColorChangerToggle"> Element Color Changer</label>
            <button id="ocean-remove-color" title="Remove All Color Changes">Clear All Color Changes</button>
        </div>
    `;
    document.body.appendChild(gui);

    const highlight = document.createElement('div');
    highlight.id = 'element-highlight';
    document.body.appendChild(highlight);

    // Protect UI elements from zapper
    const protectedIds = new Set(['ocean-navbar', 'ocean-gui', 'element-highlight', 'ocean-navbar-toggle', 'ocean-close', 'ocean-undo', 'zapperToggle', 'elementHackToggle', 'elementMoverToggle', 'ocean-clear-move', 'ocean-remove-size', 'ocean-remove-color']);
    const protectedClasses = new Set(['ocean-ui']);
    nav.classList.add('ocean-ui');
    gui.classList.add('ocean-ui');
    highlight.classList.add('ocean-ui');

    // ======= NAVBAR TOGGLE GUI =======
    let navbarVisible = true;
    let guiVisible = false;

    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
        navbarVisible = !navbarVisible;
        nav.classList.toggle('hide', !navbarVisible);
        // Hamburger stays visible at all times
        if (!navbarVisible) {
            gui.classList.remove('show');
            guiVisible = false;
        }
    });

    nav.addEventListener('click', (e) => {
        guiVisible = !guiVisible;
        if (guiVisible) {
            gui.classList.add('show');
        } else {
            gui.classList.remove('show');
        }
    });

    document.getElementById('ocean-close').addEventListener('click', () => {
        gui.classList.remove('show');
        guiVisible = false;
    });

    // ======= SAFE ELEMENT ZAPPER WITH UNZAP =======
    let zapperEnabled = false;
    const zappedElements = [];
    let currentHover = null;

    function isProtected(el) {
        if (!el) return true;
        if (protectedIds.has(el.id)) return true;
        for (const cls of el.classList) {
            if (protectedClasses.has(cls)) return true;
        }
        let p = el;
        while (p) {
            if (p.id && protectedIds.has(p.id)) return true;
            for (const cls of p.classList || []) {
                if (protectedClasses.has(cls)) return true;
            }
            p = p.parentElement;
        }
        return false;
    }

    function updateHighlight(e) {
        if (!zapperEnabled) {
            highlight.style.display = 'none';
            currentHover = null;
            return;
        }
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || isProtected(el)) {
            highlight.style.display = 'none';
            currentHover = null;
            return;
        }
        if (el === currentHover) return;

        currentHover = el;
        const rect = el.getBoundingClientRect();
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
        highlight.style.top = rect.top + 'px';
        highlight.style.left = rect.left + 'px';
        highlight.style.display = 'block';
    }

    function zapElement(e) {
        if (!zapperEnabled) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || isProtected(el)) return;
        e.preventDefault();
        e.stopPropagation();

        if (!zappedElements.some(z => z.el === el)) {
            zappedElements.push({el, prevDisplay: el.style.display});
            el.style.display = 'none';
        }
        highlight.style.display = 'none';
    }

    function unzapLast() {
        if (zappedElements.length === 0) return;
        const {el, prevDisplay} = zappedElements.pop();
        if (el) el.style.display = prevDisplay;
    }

    document.addEventListener('mousemove', updateHighlight, true);
    document.addEventListener('click', zapElement, true);

    document.getElementById('zapperToggle').addEventListener('change', (e) => {
        zapperEnabled = e.target.checked;
        highlight.style.display = 'none';
        currentHover = null;
        updateGuiButtonStates();
    });

    document.getElementById('ocean-undo').addEventListener('click', unzapLast);

    // Remove All Zaps button logic
    document.getElementById('ocean-unzap-all').addEventListener('click', () => {
        while (zappedElements.length > 0) {
            const {el, prevDisplay} = zappedElements.pop();
            if (el) el.style.display = prevDisplay;
        }
        updateGuiButtonStates();
    });

    // ======= ELEMENT HACK FEATURE =======
    let elementHackEnabled = false;
    let hackCurrentHover = null;
    let hackModal = null;

    // Store zapped elements for restoration
    let zappedForHack = [];

    // Helper: Get computed CSS as text
    function getComputedCSSText(el) {
        const style = window.getComputedStyle(el);
        let cssText = '';
        for (let i = 0; i < style.length; i++) {
            const prop = style[i];
            cssText += `${prop}: ${style.getPropertyValue(prop)};\n`;
        }
        return cssText;
    }

    // Helper: Get some JS properties (safe subset)
    function getElementJSProps(el) {
        return {
            id: el.id,
            className: el.className,
            tagName: el.tagName,
            value: el.value,
            innerText: el.innerText,
            innerHTML: el.innerHTML,
            src: el.src,
            href: el.href,
            type: el.type,
            checked: el.checked,
            disabled: el.disabled,
            readOnly: el.readOnly,
            // Add more if needed, but avoid functions or large objects
        };
    }

    // Create hack modal (in-page, not popup)
    function showHackModal(el) {
        // Zap all elements except userscript UI
        zappedForHack = [];
        document.querySelectorAll('body > *').forEach(node => {
            if (
                node.nodeType === 1 &&
                !node.classList.contains('ocean-ui') &&
                node.id !== 'element-highlight'
            ) {
                zappedForHack.push({el: node, prevDisplay: node.style.display});
                node.style.display = 'none';
            }
        });

        // Remove any existing modal
        if (hackModal) hackModal.remove();
        hackModal = document.createElement('div');
        hackModal.className = 'ocean-ui';
        hackModal.style = `
            position: fixed;
            top: 50px; left: 50%; transform: translateX(-50%);
            z-index: 2147483647;
            background: #181f2f;
            color: #fff;
            border-radius: 16px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.7);
            padding: 28px 32px 22px;
            min-width: 420px;
            max-width: 90vw;
            max-height: 80vh;
            overflow: auto;
            font-family: 'Segoe UI', sans-serif;
            pointer-events: auto;
        `;
        const htmlContent = escapeHtml(el.outerHTML);
        const cssContent = escapeHtml(getComputedCSSText(el));
        const jsContent = escapeHtml(JSON.stringify(getElementJSProps(el), null, 2));
        const tagName = el.tagName.toLowerCase();
        hackModal.innerHTML = `
            <button id="ocean-hack-close" style="
                position:absolute;top:12px;right:18px;
                background:#ff4444;color:#fff;border:none;
                border-radius:8px;padding:4px 12px;cursor:pointer;font-weight:bold;
            ">Close</button>
            <h2 style="margin-top:0;font-size:22px;">Element Hack: <span style="color:#7ecbff;">${tagName}</span></h2>
            <div style="margin-bottom:12px;">
                <strong>Raw HTML:</strong>
                <button class="ocean-hack-copy" data-copy="html" style="margin-left:8px;background:#2196f3;color:#fff;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;">Copy</button>
                <pre id="ocean-hack-html" style="background:#222c44;color:#fff;padding:10px;border-radius:8px;overflow:auto;">${htmlContent}</pre>
            </div>
            <div style="margin-bottom:12px;">
                <strong>Computed CSS:</strong>
                <button class="ocean-hack-copy" data-copy="css" style="margin-left:8px;background:#2196f3;color:#fff;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;">Copy</button>
                <pre id="ocean-hack-css" style="background:#222c44;color:#fff;padding:10px;border-radius:8px;overflow:auto;">${cssContent}</pre>
            </div>
            <div style="margin-bottom:12px;">
                <strong>JS Properties:</strong>
                <button class="ocean-hack-copy" data-copy="js" style="margin-left:8px;background:#2196f3;color:#fff;border:none;border-radius:6px;padding:2px 10px;cursor:pointer;">Copy</button>
                <pre id="ocean-hack-js" style="background:#222c44;color:#fff;padding:10px;border-radius:8px;overflow:auto;">${jsContent}</pre>
            </div>
        `;
        document.body.appendChild(hackModal);

        // Copy button logic
        hackModal.querySelectorAll('.ocean-hack-copy').forEach(btn => {
            btn.onclick = function() {
                let type = btn.getAttribute('data-copy');
                let text = '';
                if (type === 'html') text = htmlContent;
                if (type === 'css') text = cssContent;
                if (type === 'js') text = jsContent;
                navigator.clipboard.writeText(text);
                btn.textContent = 'Copied!';
                setTimeout(() => { btn.textContent = 'Copy'; }, 1200);
            };
        });

        // Close button logic: restore zapped elements
        document.getElementById('ocean-hack-close').onclick = () => {
            if (hackModal) {
                hackModal.remove();
                hackModal = null;
            }
            // Restore all zapped elements
            zappedForHack.forEach(({el, prevDisplay}) => {
                el.style.display = prevDisplay;
            });
            zappedForHack = [];
            updateGuiButtonStates();
        };
    }

    // Helper: Escape HTML for <pre>
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    // Element Hack highlight
    function updateHackHighlight(e) {
        if (!elementHackEnabled) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || isProtected(el)) {
            highlight.style.display = 'none';
            hackCurrentHover = null;
            return;
        }
        if (el === hackCurrentHover) return;
        hackCurrentHover = el;
        const rect = el.getBoundingClientRect();
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
        highlight.style.top = rect.top + 'px';
        highlight.style.left = rect.left + 'px';
        highlight.style.display = 'block';
        highlight.style.border = '3px solid #2196f3'; // blue
        highlight.style.zIndex = '2147483647'; // always on top
        highlight.style.pointerEvents = 'none';
        highlight.style.background = 'rgba(33,150,243,0.08)'; // subtle blue overlay
    }

    function hackElement(e) {
        if (!elementHackEnabled) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || isProtected(el)) return;
        e.preventDefault();
        e.stopPropagation();
        showHackModal(el);
        highlight.style.display = 'none';
        updateGuiButtonStates();
    }

    // ======= ELEMENT MOVER FEATURE =======
    let elementMoverEnabled = false;
    let moverCurrentHover = null;
    let moverSelected = null;
    let moverButton = null;
    let moverOffset = {x: 0, y: 0};
    let movedElements = []; // {el, prevStyle}
    let moverCooldown = false;

    document.getElementById('elementMoverToggle').addEventListener('change', (e) => {
        elementMoverEnabled = e.target.checked;
        if (elementMoverEnabled) {
            zapperEnabled = false;
            elementHackEnabled = false;
            document.getElementById('zapperToggle').checked = false;
            document.getElementById('elementHackToggle').checked = false;
        }
        highlight.style.display = 'none';
        if (moverCurrentHover) moverCurrentHover.classList.remove('ocean-mover-hint');
        moverCurrentHover = null;
        if (!elementMoverEnabled && moverButton) {
            moverButton.remove();
            moverButton = null;
            if (moverSelected) {
                moverSelected.classList.remove('ocean-mover-highlight');
                moverSelected = null;
            }
        }
        updateGuiButtonStates();
    });

    // Highlight on hover for mover (use highlight box, same as Element Hack)
    document.addEventListener('mousemove', (e) => {
        if (!elementMoverEnabled || moverCooldown) return;

        const el = document.elementFromPoint(e.clientX, e.clientY);

        // If not hovering a valid element, clear highlight
        if (!el || isProtected(el)) {
            highlight.style.display = 'none';
            moverCurrentHover = null;
            return;
        }

        // If hovering the same element, do nothing
        if (el === moverCurrentHover) return;

        moverCurrentHover = el;

        // Show highlight box as hint (EXACTLY like Element Hack)
        const rect = el.getBoundingClientRect();
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
        highlight.style.top = rect.top + 'px';
        highlight.style.left = rect.left + 'px';
        highlight.style.display = 'block';
        highlight.style.border = '3px solid #2196f3'; // solid blue, same as Element Hack
        highlight.style.zIndex = '2147483647';
        highlight.style.pointerEvents = 'none';
        highlight.style.background = 'rgba(33,150,243,0.08)'; // subtle blue overlay
    }, true);

    // Click to select element and show mover/unselect buttons
    document.addEventListener('click', (e) => {
        if (!elementMoverEnabled || moverCooldown) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || isProtected(el)) return;
        e.preventDefault();
        e.stopPropagation();

        // Remove previous mover button and highlight
        if (moverButton) moverButton.remove();
        if (moverSelected) moverSelected.classList.remove('ocean-mover-highlight');

        moverSelected = el;
        moverSelected.classList.add('ocean-mover-highlight');

        // Hide the highlight box (since now it's selected)
        highlight.style.display = 'none';

        // Place mover button at mouse click location
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        moverButton = document.createElement('div');
        moverButton.style.position = 'fixed';
        moverButton.style.left = mouseX + 'px';
        moverButton.style.top = mouseY + 'px';
        moverButton.style.zIndex = 2147483647;
        moverButton.style.display = 'flex';
        moverButton.style.gap = '4px';

        // FontAwesome move icon button
        const dragBtn = document.createElement('button');
        dragBtn.innerHTML = '<i class="fas fa-arrows-alt"></i>';
        dragBtn.style.background = '#ff9800';
        dragBtn.style.color = '#fff';
        dragBtn.style.border = 'none';
        dragBtn.style.borderRadius = '6px';
        dragBtn.style.padding = '2px 8px';
        dragBtn.style.cursor = 'grab';
        dragBtn.style.fontWeight = 'bold';
        dragBtn.style.fontSize = '18px';
        dragBtn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.2)';
        dragBtn.style.userSelect = 'none';
        dragBtn.style.display = 'flex';
        dragBtn.style.alignItems = 'center';
        dragBtn.style.justifyContent = 'center';

        // Unselect button
        const unselectBtn = document.createElement('button');
        unselectBtn.textContent = 'Unselect';
        unselectBtn.title = 'Unselect this element';
        unselectBtn.style.background = '#fff';
        unselectBtn.style.color = '#ff9800';
        unselectBtn.style.border = '1.5px solid #ff9800';
        unselectBtn.style.borderRadius = '6px';
        unselectBtn.style.padding = '2px 8px';
        unselectBtn.style.cursor = 'pointer';
        unselectBtn.style.fontWeight = 'bold';
        unselectBtn.style.userSelect = 'none';

        moverButton.appendChild(dragBtn);
        moverButton.appendChild(unselectBtn);
        document.body.appendChild(moverButton);

        // Drag logic
        let dragging = false;
        let startX, startY, origX, origY;

        dragBtn.onmousedown = function(ev) {
            ev.preventDefault();
            dragging = true;
            dragBtn.style.cursor = 'grabbing';
            startX = ev.clientX;
            startY = ev.clientY;
            const elRect = moverSelected.getBoundingClientRect();
            origX = elRect.left + window.scrollX;
            origY = elRect.top + window.scrollY;

            // Save original style if not already saved
            if (!movedElements.some(obj => obj.el === moverSelected)) {
                movedElements.push({
                    el: moverSelected,
                    prevStyle: {
                        position: moverSelected.style.position,
                        left: moverSelected.style.left,
                        top: moverSelected.style.top,
                        zIndex: moverSelected.style.zIndex
                    }
                });
            }

            document.onmousemove = function(moveEv) {
                if (!dragging) return;
                let dx = moveEv.clientX - startX;
                let dy = moveEv.clientY - startY;
                moverSelected.style.position = 'fixed';
                moverSelected.style.left = (origX + dx - window.scrollX) + 'px';
                moverSelected.style.top = (origY + dy - window.scrollY) + 'px';
                moverSelected.style.zIndex = 2147483646;
                // Move the button with the mouse
                moverButton.style.left = moveEv.clientX + 'px';
                moverButton.style.top = moveEv.clientY + 'px';
            };

            document.onmouseup = function() {
                dragging = false;
                dragBtn.style.cursor = 'grab';
                document.onmousemove = null;
                document.onmouseup = null;
            };
        };

        // Unselect logic
        unselectBtn.onclick = function(ev) {
            ev.preventDefault();
            if (moverButton) moverButton.remove();
            if (moverSelected) {
                moverSelected.classList.remove('ocean-mover-highlight');
                moverSelected = null;
            }
            updateGuiButtonStates();
        };
    }, true);

    // Clear all move button logic
    document.getElementById('ocean-clear-move').addEventListener('click', () => {
        movedElements.forEach(({el, prevStyle}) => {
            el.style.position = prevStyle.position;
            el.style.left = prevStyle.left;
            el.style.top = prevStyle.top;
            el.style.zIndex = prevStyle.zIndex;
            el.classList.remove('ocean-mover-highlight');
        });
        movedElements = [];
        if (moverButton) {
            moverButton.remove();
            moverButton = null;
        }
        if (moverSelected) {
            moverSelected.classList.remove('ocean-mover-highlight');
            moverSelected = null;
        }
        moverCurrentHover = null;
        highlight.style.display = 'none';
        updateGuiButtonStates();
    });

    // ======= TOGGLE LOGIC =======
    document.getElementById('elementHackToggle').addEventListener('change', (e) => {
        elementHackEnabled = e.target.checked;
        if (elementHackEnabled) {
            zapperEnabled = false;
            document.getElementById('zapperToggle').checked = false;
        }
        highlight.style.display = 'none';
        hackCurrentHover = null;
        updateGuiButtonStates();
    });

    // Update highlight for both zapper and hack
    document.addEventListener('mousemove', (e) => {
        if (elementHackEnabled) {
            updateHackHighlight(e);
        } else if (zapperEnabled) {
            updateHighlight(e);
        } else {
            highlight.style.display = 'none';
        }
    }, true);

    // Click for both zapper and hack
    document.addEventListener('click', (e) => {
        if (elementHackEnabled) {
            hackElement(e);
        } else if (zapperEnabled) {
            zapElement(e);
        }
    }, true);

    // ======= ELEMENT SIZE CHANGER FEATURE =======
    let elementSizeChangerEnabled = false;
    let sizeChangerCurrentHover = null;
    let sizeChangerSelected = null;
    let sizeChangerButton = null;
    let sizeChangedElements = []; // {el, prevWidth, prevHeight, prevBoxSizing}
    let sizeChangerLocked = false;

    document.getElementById('elementSizeChangerToggle').addEventListener('change', (e) => {
        elementSizeChangerEnabled = e.target.checked;
        // Disable other features if needed
        zapperEnabled = false;
        elementHackEnabled = false;
        elementMoverEnabled = false;
        document.getElementById('zapperToggle').checked = false;
        document.getElementById('elementHackToggle').checked = false;
        document.getElementById('elementMoverToggle').checked = false;
        highlight.style.display = 'none';
        if (sizeChangerCurrentHover) sizeChangerCurrentHover.classList.remove('ocean-mover-hint');
        sizeChangerCurrentHover = null;
        if (!elementSizeChangerEnabled && sizeChangerButton) {
            sizeChangerButton.remove();
            sizeChangerButton = null;
            if (sizeChangerSelected) {
                sizeChangerSelected.classList.remove('ocean-mover-highlight');
                sizeChangerSelected = null;
            }
            sizeChangerLocked = false;
        }
        updateGuiButtonStates();
    });

    // Highlight on hover
    document.addEventListener('mousemove', (e) => {
        if (!elementSizeChangerEnabled || sizeChangerLocked) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || isProtected(el)) {
            highlight.style.display = 'none';
            sizeChangerCurrentHover = null;
            return;
        }
        if (el === sizeChangerCurrentHover) return;
        sizeChangerCurrentHover = el;
        const rect = el.getBoundingClientRect();
        highlight.style.width = rect.width + 'px';
        highlight.style.height = rect.height + 'px';
        highlight.style.top = rect.top + 'px';
        highlight.style.left = rect.left + 'px';
        highlight.style.display = 'block';
        highlight.style.border = '3px solid #4caf50'; // green
        highlight.style.zIndex = '2147483647';
        highlight.style.pointerEvents = 'none';
        highlight.style.background = 'rgba(76,175,80,0.08)';
    }, true);

    // Click to select and show size changer buttons
    document.addEventListener('click', (e) => {
        if (!elementSizeChangerEnabled || sizeChangerLocked) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || isProtected(el)) return;
        e.preventDefault();
        e.stopPropagation();

        // Remove previous button and highlight
        if (sizeChangerButton) sizeChangerButton.remove();
        if (sizeChangerSelected) sizeChangerSelected.classList.remove('ocean-mover-highlight');

        sizeChangerSelected = el;
        sizeChangerSelected.classList.add('ocean-mover-highlight');
        highlight.style.display = 'none';

        // Save original size if not already saved
        if (!sizeChangedElements.some(obj => obj.el === sizeChangerSelected)) {
            sizeChangedElements.push({
                el: sizeChangerSelected,
                prevWidth: sizeChangerSelected.style.width,
                prevHeight: sizeChangerSelected.style.height,
                prevBoxSizing: sizeChangerSelected.style.boxSizing
            });
        }

        // Place size changer buttons
        sizeChangerButton = document.createElement('div');
        sizeChangerButton.style.position = 'fixed';
        sizeChangerButton.style.left = e.clientX + 'px';
        sizeChangerButton.style.top = e.clientY + 'px';
        sizeChangerButton.style.zIndex = 2147483647;
        sizeChangerButton.style.display = 'flex';
        sizeChangerButton.style.gap = '4px';

        // + button
        const plusBtn = document.createElement('button');
        plusBtn.textContent = '+';
        plusBtn.title = 'Increase size';
        plusBtn.onclick = function(ev) {
            ev.preventDefault();
            let rect = sizeChangerSelected.getBoundingClientRect();
            sizeChangerSelected.style.boxSizing = 'border-box';
            sizeChangerSelected.style.transition = 'width 0.5s cubic-bezier(.34,1.56,.64,1), height 0.5s cubic-bezier(.34,1.56,.64,1)';
            sizeChangerSelected.style.width = (rect.width * 1.1) + 'px';
            sizeChangerSelected.style.height = (rect.height * 1.1) + 'px';
        };

        // - button
        const minusBtn = document.createElement('button');
        minusBtn.textContent = '-';
        minusBtn.title = 'Decrease size';
        minusBtn.onclick = function(ev) {
            ev.preventDefault();
            let rect = sizeChangerSelected.getBoundingClientRect();
            sizeChangerSelected.style.boxSizing = 'border-box';
            sizeChangerSelected.style.transition = 'width 0.5s cubic-bezier(.34,1.56,.64,1), height 0.5s cubic-bezier(.34,1.56,.64,1)';
            sizeChangerSelected.style.width = (rect.width * 0.9) + 'px';
            sizeChangerSelected.style.height = (rect.height * 0.9) + 'px';
        };

        // Unselect button
        const unselectBtn = document.createElement('button');
        unselectBtn.textContent = 'Unselect';
        unselectBtn.title = 'Unselect this element';
        unselectBtn.onclick = function(ev) {
            ev.preventDefault();
            if (sizeChangerButton) sizeChangerButton.remove();
            if (sizeChangerSelected) {
                sizeChangerSelected.classList.remove('ocean-mover-highlight');
                sizeChangerSelected = null;
            }
            sizeChangerLocked = false;
            updateGuiButtonStates();
        };

        sizeChangerButton.appendChild(plusBtn);
        sizeChangerButton.appendChild(minusBtn);
        sizeChangerButton.appendChild(unselectBtn);
        document.body.appendChild(sizeChangerButton);

        // Lock selection: only allow these buttons to be clicked
        sizeChangerLocked = true;

        // --- Ensure controls are always visible on screen ---
        const btnRect = sizeChangerButton.getBoundingClientRect();
        const margin = 10; // px from edge

        // If too far right, move left
        if (btnRect.right > window.innerWidth - margin) {
            sizeChangerButton.style.left = (window.innerWidth - btnRect.width - margin) + 'px';
        }
        // If too far left, move right
        if (btnRect.left < margin) {
            sizeChangerButton.style.left = margin + 'px';
        }
        // If too low, move up
        if (btnRect.bottom > window.innerHeight - margin) {
            sizeChangerButton.style.top = (window.innerHeight - btnRect.height - margin) + 'px';
        }
        // If too high, move down
        if (btnRect.top < margin) {
            sizeChangerButton.style.top = margin + 'px';
        }
    }, true);

    // Block all other clicks when locked
    document.addEventListener('click', (e) => {
        if (elementSizeChangerEnabled && sizeChangerLocked) {
            if (!sizeChangerButton.contains(e.target)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }, true);

    // Remove All Changed Size button logic
    document.getElementById('ocean-remove-size').addEventListener('click', () => {
        sizeChangedElements.forEach(({el, prevWidth, prevHeight, prevBoxSizing}) => {
            el.style.width = prevWidth;
            el.style.height = prevHeight;
            el.style.boxSizing = prevBoxSizing;
            el.classList.remove('ocean-mover-highlight');
        });
        sizeChangedElements = [];
        if (sizeChangerButton) {
            sizeChangerButton.remove();
            sizeChangerButton = null;
        }
        if (sizeChangerSelected) {
            sizeChangerSelected.classList.remove('ocean-mover-highlight');
            sizeChangerSelected = null;
        }
        sizeChangerCurrentHover = null;
        highlight.style.display = 'none';
        sizeChangerLocked = false;
        updateGuiButtonStates();
    });

    // ======= ELEMENT COLOR CHANGER FEATURE =======
    let elementColorChangerEnabled = false;
    let colorChangerCurrentHover = null;
    let colorChangerSelected = null;
    let colorChangerButton = null;
    let colorChangedElements = []; // {el, prevStyles: {property: value}}
    let colorChangerLocked = false;

    // Helper: Get all color-related CSS properties
    function getColorProperties(el) {
        const computedStyle = window.getComputedStyle(el);
        const colorProps = [
            'color', 'background-color', 'border-color', 'border-top-color', 
            'border-right-color', 'border-bottom-color', 'border-left-color',
            'outline-color', 'text-decoration-color', 'fill', 'stroke',
            'box-shadow', 'text-shadow', 'filter'
        ];
        
        const availableProps = {};
        colorProps.forEach(prop => {
            const value = computedStyle.getPropertyValue(prop);
            if (value && value !== 'none' && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
                availableProps[prop] = value;
            }
        });
        
        // Also check for any custom properties that might contain colors
        for (let i = 0; i < computedStyle.length; i++) {
            const prop = computedStyle[i];
            if (prop.includes('color') || prop.includes('shadow') || prop.includes('fill') || prop.includes('stroke')) {
                const value = computedStyle.getPropertyValue(prop);
                if (value && value !== 'none' && value !== 'transparent' && value !== 'rgba(0, 0, 0, 0)') {
                    availableProps[prop] = value;
                }
            }
        }
        
        return availableProps;
    }

    // Helper: Save all original styles
    function saveOriginalStyles(el) {
        const computedStyle = window.getComputedStyle(el);
        const savedStyles = {};
        const colorProps = [
            'color', 'background-color', 'border-color', 'border-top-color', 
            'border-right-color', 'border-bottom-color', 'border-left-color',
            'outline-color', 'text-decoration-color', 'fill', 'stroke',
            'box-shadow', 'text-shadow', 'filter'
        ];
        
        colorProps.forEach(prop => {
            savedStyles[prop] = el.style[prop] || '';
        });
        
        return savedStyles;
    }

    document.getElementById('elementColorChangerToggle').addEventListener('change', (e) => {
        elementColorChangerEnabled = e.target.checked;
        // Disable other features if needed
        zapperEnabled = false;
        elementHackEnabled = false;
        elementMoverEnabled = false;
        elementSizeChangerEnabled = false;
        document.getElementById('zapperToggle').checked = false;
        document.getElementById('elementHackToggle').checked = false;
        document.getElementById('elementMoverToggle').checked = false;
        document.getElementById('elementSizeChangerToggle').checked = false;
        highlight.style.display = 'none';
        if (colorChangerCurrentHover) colorChangerCurrentHover.classList.remove('ocean-mover-hint');
        colorChangerCurrentHover = null;
        if (!elementColorChangerEnabled && colorChangerButton) {
            colorChangerButton.remove();
            colorChangerButton = null;
            if (colorChangerSelected) {
                colorChangerSelected.classList.remove('ocean-mover-highlight');
                colorChangerSelected = null;
            }
            colorChangerLocked = false;
        }
        updateGuiButtonStates();
    });

    // Click to select and show color changer controls
    document.addEventListener('click', (e) => {
        if (!elementColorChangerEnabled || colorChangerLocked) return;
        const el = document.elementFromPoint(e.clientX, e.clientY);
        if (!el || isProtected(el)) return;
        e.preventDefault();
        e.stopPropagation();

        // Remove previous button and highlight
        if (colorChangerButton) colorChangerButton.remove();
        if (colorChangerSelected) colorChangerSelected.classList.remove('ocean-mover-highlight');

        colorChangerSelected = el;
        colorChangerSelected.classList.add('ocean-mover-highlight');
        highlight.style.display = 'none';

        // Save original styles if not already saved
        if (!colorChangedElements.some(obj => obj.el === colorChangerSelected)) {
            colorChangedElements.push({
                el: colorChangerSelected,
                prevStyles: saveOriginalStyles(colorChangerSelected)
            });
        }

        // Get all available color properties
        const colorProps = getColorProperties(colorChangerSelected);

        // Create color changer modal
        colorChangerButton = document.createElement('div');
        colorChangerButton.style.position = 'fixed';
        colorChangerButton.style.left = e.clientX + 'px';
        colorChangerButton.style.top = e.clientY + 'px';
        colorChangerButton.style.zIndex = 2147483647;
        colorChangerButton.style.background = '#23272e';
        colorChangerButton.style.padding = '16px';
        colorChangerButton.style.borderRadius = '12px';
        colorChangerButton.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
        colorChangerButton.style.maxWidth = '400px';
        colorChangerButton.style.maxHeight = '80vh';
        colorChangerButton.style.overflow = 'auto';
        colorChangerButton.style.fontFamily = 'Segoe UI, sans-serif';
        colorChangerButton.style.color = '#fff';

        // Title
        const title = document.createElement('h3');
        title.textContent = '🎨 Color Changer';
        title.style.margin = '0 0 12px 0';
        title.style.fontSize = '18px';
        title.style.color = '#7ecbff';
        colorChangerButton.appendChild(title);

        // Unselect button at the top
        const unselectBtn = document.createElement('button');
        unselectBtn.textContent = '❌ Unselect';
        unselectBtn.title = 'Unselect this element';
        unselectBtn.style.background = '#ff4444';
        unselectBtn.style.color = '#fff';
        unselectBtn.style.border = 'none';
        unselectBtn.style.borderRadius = '6px';
        unselectBtn.style.padding = '6px 12px';
        unselectBtn.style.cursor = 'pointer';
        unselectBtn.style.fontWeight = 'bold';
        unselectBtn.style.marginBottom = '12px';
        unselectBtn.style.width = '100%';
        unselectBtn.onclick = function(ev) {
            ev.preventDefault();
            if (colorChangerButton) colorChangerButton.remove();
            if (colorChangerSelected) {
                colorChangerSelected.classList.remove('ocean-mover-highlight');
                colorChangerSelected = null;
            }
            colorChangerLocked = false;
            updateGuiButtonStates();
        };
        colorChangerButton.appendChild(unselectBtn);

        // Show available CSS properties
        if (Object.keys(colorProps).length > 0) {
            const propsTitle = document.createElement('div');
            propsTitle.textContent = 'Available CSS Properties:';
            propsTitle.style.fontWeight = 'bold';
            propsTitle.style.marginBottom = '8px';
            propsTitle.style.color = '#4caf50';
            colorChangerButton.appendChild(propsTitle);

            const propsList = document.createElement('div');
            propsList.style.marginBottom = '12px';
            propsList.style.fontSize = '12px';
            propsList.style.color = '#ccc';
            propsList.style.maxHeight = '100px';
            propsList.style.overflow = 'auto';
            propsList.style.background = '#1a1e2a';
            propsList.style.padding = '8px';
            propsList.style.borderRadius = '6px';
            
            Object.keys(colorProps).forEach(prop => {
                const propItem = document.createElement('div');
                propItem.textContent = `${prop}: ${colorProps[prop]}`;
                propItem.style.marginBottom = '2px';
                propsList.appendChild(propItem);
            });
            colorChangerButton.appendChild(propsList);
        }

        // Create color inputs for common properties
        const commonProps = [
            { name: 'Text Color', prop: 'color', icon: '🎨' },
            { name: 'Background', prop: 'background-color', icon: '🎨' },
            { name: 'Border', prop: 'border-color', icon: '🔲' },
            { name: 'Outline', prop: 'outline-color', icon: '📝' },
            { name: 'Text Shadow', prop: 'text-shadow', icon: '✨' },
            { name: 'Box Shadow', prop: 'box-shadow', icon: '💫' }
        ];

        commonProps.forEach(({ name, prop, icon }) => {
            const container = document.createElement('div');
            container.style.display = 'flex';
            container.style.alignItems = 'center';
            container.style.marginBottom = '8px';
            container.style.gap = '8px';

            const label = document.createElement('span');
            label.textContent = `${icon} ${name}:`;
            label.style.fontSize = '14px';
            label.style.minWidth = '100px';

            const colorInput = document.createElement('input');
            colorInput.type = 'color';
            colorInput.style.width = '40px';
            colorInput.style.height = '30px';
            colorInput.style.border = 'none';
            colorInput.style.borderRadius = '4px';
            colorInput.style.cursor = 'pointer';
            
            // Set current value if available
            const currentValue = getComputedStyle(colorChangerSelected).getPropertyValue(prop);
            if (currentValue && currentValue !== 'none' && currentValue !== 'transparent') {
                colorInput.value = rgbToHex(currentValue);
            } else {
                colorInput.value = '#000000';
            }

            colorInput.oninput = function(ev) {
                colorChangerSelected.style.transition = `${prop} 0.3s cubic-bezier(.34,1.56,.64,1)`;
                colorChangerSelected.style[prop] = colorInput.value;
            };

            container.appendChild(label);
            container.appendChild(colorInput);
            colorChangerButton.appendChild(container);
        });

        // Advanced section
        const advancedTitle = document.createElement('div');
        advancedTitle.textContent = '🔧 Advanced Properties:';
        advancedTitle.style.fontWeight = 'bold';
        advancedTitle.style.marginTop = '12px';
        advancedTitle.style.marginBottom = '8px';
        advancedTitle.style.color = '#ff9800';
        colorChangerButton.appendChild(advancedTitle);

        // Create inputs for all available properties
        Object.keys(colorProps).forEach(prop => {
            if (!['color', 'background-color', 'border-color', 'outline-color', 'text-shadow', 'box-shadow'].includes(prop)) {
                const container = document.createElement('div');
                container.style.display = 'flex';
                container.style.alignItems = 'center';
                container.style.marginBottom = '6px';
                container.style.gap = '8px';

                const label = document.createElement('span');
                label.textContent = prop;
                label.style.fontSize = '12px';
                label.style.minWidth = '120px';
                label.style.color = '#ccc';

                const colorInput = document.createElement('input');
                colorInput.type = 'color';
                colorInput.style.width = '30px';
                colorInput.style.height = '25px';
                colorInput.style.border = 'none';
                colorInput.style.borderRadius = '3px';
                colorInput.style.cursor = 'pointer';
                colorInput.value = rgbToHex(colorProps[prop]);

                colorInput.oninput = function(ev) {
                    colorChangerSelected.style.transition = `${prop} 0.3s cubic-bezier(.34,1.56,.64,1)`;
                    colorChangerSelected.style[prop] = colorInput.value;
                };

                container.appendChild(label);
                container.appendChild(colorInput);
                colorChangerButton.appendChild(container);
            }
        });

        // Reset button at the bottom
        const resetBtn = document.createElement('button');
        resetBtn.textContent = '🔄 Reset This';
        resetBtn.title = 'Reset colors for this element';
        resetBtn.style.background = '#ff9800';
        resetBtn.style.color = '#fff';
        resetBtn.style.border = 'none';
        resetBtn.style.borderRadius = '6px';
        resetBtn.style.padding = '6px 12px';
        resetBtn.style.cursor = 'pointer';
        resetBtn.style.fontWeight = 'bold';
        resetBtn.style.marginTop = '16px';
        resetBtn.style.width = '100%';
        resetBtn.onclick = function(ev) {
            ev.preventDefault();
            const elementData = colorChangedElements.find(obj => obj.el === colorChangerSelected);
            if (elementData) {
                Object.keys(elementData.prevStyles).forEach(prop => {
                    colorChangerSelected.style[prop] = elementData.prevStyles[prop];
                });
                colorChangedElements = colorChangedElements.filter(obj => obj.el !== colorChangerSelected);
            }
        };
        colorChangerButton.appendChild(resetBtn);

        document.body.appendChild(colorChangerButton);

        // Lock selection: only allow these controls to be clicked
        colorChangerLocked = true;

        // --- Ensure controls are always visible on screen ---
        setTimeout(() => {
            const btnRect = colorChangerButton.getBoundingClientRect();
            const margin = 10; // px from edge

            let newLeft = parseInt(colorChangerButton.style.left, 10);
            let newTop = parseInt(colorChangerButton.style.top, 10);

            if (btnRect.right > window.innerWidth - margin) {
                newLeft = window.innerWidth - btnRect.width - margin;
            }
            if (btnRect.left < margin) {
                newLeft = margin;
            }
            if (btnRect.bottom > window.innerHeight - margin) {
                newTop = window.innerHeight - btnRect.height - margin;
            }
            if (btnRect.top < margin) {
                newTop = margin;
            }
            colorChangerButton.style.left = newLeft + 'px';
            colorChangerButton.style.top = newTop + 'px';
        }, 0);
    }, true);

    // Block all other clicks when locked
    document.addEventListener('click', (e) => {
        if (elementColorChangerEnabled && colorChangerLocked) {
            if (!colorChangerButton.contains(e.target)) {
                e.stopPropagation();
                e.preventDefault();
            }
        }
    }, true);

    // Remove All Color Changes button logic
    document.getElementById('ocean-remove-color').addEventListener('click', () => {
        colorChangedElements.forEach(({el, prevColor, prevBg, prevTransition}) => {
            el.style.color = prevColor;
            el.style.backgroundColor = prevBg;
            el.style.transition = prevTransition;
            el.classList.remove('ocean-mover-highlight');
        });
        colorChangedElements = [];
        if (colorChangerButton) {
            colorChangerButton.remove();
            colorChangerButton = null;
        }
        if (colorChangerSelected) {
            colorChangerSelected.classList.remove('ocean-mover-highlight');
            colorChangerSelected = null;
        }
        colorChangerCurrentHover = null;
        highlight.style.display = 'none';
        colorChangerLocked = false;
        updateGuiButtonStates();
    });

    // Helper: Convert rgb/rgba to hex
    function rgbToHex(rgb) {
        if (!rgb) return '#000000';
        let result = rgb.match(/\d+/g);
        if (!result) return '#000000';
        let r = parseInt(result[0]).toString(16).padStart(2, '0');
        let g = parseInt(result[1]).toString(16).padStart(2, '0');
        let b = parseInt(result[2]).toString(16).padStart(2, '0');
        return `#${r}${g}${b}`;
    }

    // ======= MAKE GUI DRAGGABLE =======
    let isDraggingGUI = false, dragOffsetX = 0, dragOffsetY = 0;
    gui.style.cursor = 'move';
    gui.addEventListener('mousedown', function(e) {
        if (e.target !== gui) return; // Only drag when clicking the background, not buttons
        isDraggingGUI = true;
        dragOffsetX = e.clientX - gui.getBoundingClientRect().left;
        dragOffsetY = e.clientY - gui.getBoundingClientRect().top;
        gui.style.transition = 'none';
    });
    document.addEventListener('mousemove', function(e) {
        if (!isDraggingGUI) return;
        gui.style.left = (e.clientX - dragOffsetX) + 'px';
        gui.style.top = (e.clientY - dragOffsetY) + 'px';
        gui.style.position = 'fixed';
    });
    document.addEventListener('mouseup', function() {
        isDraggingGUI = false;
        gui.style.transition = '';
    });

    // ======= FORCE REMOVE WEBSITE BACKGROUND & POPUP SOLID BG =======
    // Remove all backgrounds and set Vanta as the only background
    // DELETE EVERYTHING BELOW (forceRemoveBackground and observer)
    // const forceRemoveBackground = () => {
    //     // Remove backgrounds from body, html, and all elements
    //     document.body.style.background = 'transparent';
    //     document.documentElement.style.background = 'transparent';
    //     // Remove backgrounds from all elements
    //     const allEls = document.querySelectorAll('*');
    //     allEls.forEach(el => {
    //         if (!el.classList.contains('ocean-ui')) {
    //             el.style.background = 'transparent';
    //             el.style.backgroundColor = 'transparent';
    //         }
    //     });
    // };
    // // Run on load and after DOM changes
    // forceRemoveBackground();
    // // MutationObserver to keep backgrounds removed
    // const bgObserver = new MutationObserver(forceRemoveBackground);
    // bgObserver.observe(document.body, { childList: true, subtree: true, attributes: true });

    // Solid background for popups/UIs in vanilla website
    const solidifyPopups = () => {
        // Target common popup/modal/dialog elements
        const popupSelectors = [
            'dialog', '[role="dialog"]', '[role="alertdialog"]', '.modal', '.popup', '.dialog', '.alert', '.ui-dialog'
        ];
        document.querySelectorAll(popupSelectors.join(',')).forEach(el => {
            if (!el.classList.contains('ocean-ui')) {
                el.style.background = '#222c44';
                el.style.backgroundColor = '#222c44';
                el.style.color = '#fff';
                el.style.borderRadius = '12px';
                el.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4)';
            }
        });
    };
    solidifyPopups();
    // Observe for new popups
    const popupObserver = new MutationObserver(solidifyPopups);
    popupObserver.observe(document.body, { childList: true, subtree: true });

    // Inject FontAwesome if not already present
    if (!document.getElementById('fa-mover-inject')) {
        const fa = document.createElement('link');
        fa.id = 'fa-mover-inject';
        fa.rel = 'stylesheet';
        fa.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css';
        document.head.appendChild(fa);
    }

    function updateGuiButtonStates() {
        const features = [
            {id: 'zapperToggle', enabled: zapperEnabled},
            {id: 'elementHackToggle', enabled: elementHackEnabled},
            {id: 'elementMoverToggle', enabled: elementMoverEnabled},
            {id: 'elementSizeChangerToggle', enabled: elementSizeChangerEnabled},
            {id: 'elementColorChangerToggle', enabled: elementColorChangerEnabled}
        ];
        const active = features.find(f => f.enabled);
        const guiButtons = gui.querySelectorAll('button');
        const guiToggles = gui.querySelectorAll('input[type="checkbox"]');
        if (active) {
            guiButtons.forEach(btn => {
                btn.disabled = true;
                btn.style.opacity = 0.5;
                btn.style.pointerEvents = 'none';
            });
            guiToggles.forEach(toggle => {
                toggle.disabled = false;
                toggle.parentElement.style.opacity = 1;
            });
        } else {
            guiButtons.forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = 1;
                btn.style.pointerEvents = '';
            });
            guiToggles.forEach(toggle => {
                toggle.disabled = false;
                toggle.parentElement.style.opacity = 1;
            });
        }
    }
})();
