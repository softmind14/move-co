/* ==========================================================
   MOVE & CO. — Chatbot « Moussou »
   Widget + intégration /api/chat (Vercel / Gemini)
   Repli local automatique hors serveur Vercel
   ========================================================== */
(function () {
    'use strict';

    var HISTORIQUE = [];
    var enAttente = false;

    /* ---------- Réponses de secours (hors API) ---------- */
    var REGLES = [
        { cles: ['bonjour', 'salut', 'bonsoir', 'hello', 'coucou'], rep: "Bonjour et bienvenue chez Move & Co ! Je suis Moussou, l'assistant officiel. Comment puis-je vous aider aujourd'hui ?" },
        { cles: ['tarif', 'prix', 'coûte', 'coute', 'combien', 'fcfa'], rep: "Nos prix : Tenue sportive 15 000 FCFA · Accessoires & gourdes 7 500 FCFA · Kit d'élastiques 6 000 FCFA · Pack Évolution 35 000 FCFA. Pour les formules de coaching, le premier bilan est offert." },
        { cles: ['horaire', 'quand', 'ouvert', 'fermé', 'ferme', 'heure'], rep: "Nous sommes ouverts du lundi au samedi, de 6h00 à 20h00. Vous pouvez venir ou nous contacter pour réserver." },
        { cles: ['où', 'ou ', 'adresse', 'situe', 'localis', 'abomey', 'bénin', 'benin'], rep: "Nous sommes basés à Abomey-Calavi, au Bénin. Écrivez-nous pour convenir du lieu de votre séance." },
        { cles: ['contact', 'téléphone', 'telephone', 'whatsapp', 'numéro', 'numero', 'appeler', 'mail', 'email'], rep: "Vous pouvez nous joindre au +229 XX XX XX XX (téléphone/WhatsApp) ou par email : contact@moveandco.com. Réponse sous 24h." },
        { cles: ['coaching', 'séance', 'seance', 'programme', 'formule', 'accompagn'], rep: "Nous proposons 3 formules : Coaching Individuel (100% sur-mesure), Coaching en Groupe (collectif motivant) et Remise en Forme & Bien-être. Toutes commencent par un bilan gratuit !" },
        { cles: ['boutique', 'acheter', 'tenue', 'équipement', 'equipement', 'gourde', 'tapis', 'élastique', 'elastique', 'débardeur', 'pack'], rep: "Notre boutique officielle propose tenues, accessoires et packs. Livraison locale offerte dès 20 000 FCFA, paiement à la livraison. Détails sur la page Boutique !" },
        { cles: ['bilan', 'réserver', 'reserver', 'rendez-vous', 'rdv', 'inscri', 'commencer'], rep: "Excellent choix ! Votre premier bilan est offert, sans engagement. Contactez-nous au +229 XX XX XX XX ou via la page Contact pour fixer votre rendez-vous." },
        { cles: ['merci', 'super', 'parfait', 'génial', 'genial'], rep: "Avec plaisir ! N'hésitez pas si vous avez d'autres questions. On se voit bientôt à l'entraînement !" },
        { cles: ['coach', 'équipe', 'equipe', 'qui'], rep: "Notre équipe : Yédydia KPLOYA (fondateur), HONVO Melckiade (musculation), HOUNSA Samuel (athlétisme), OGOUDELE Ariane (remise en forme), OCHILET Fanya (yoga & bien-être) et COUTON Norah (fitness & nutrition). Six coachs certifiés, du lundi au samedi." }
    ];

    function reponseSecours(msg) {
        var t = msg.toLowerCase();
        for (var i = 0; i < REGLES.length; i++) {
            for (var j = 0; j < REGLES[i].cles.length; j++) {
                if (t.indexOf(REGLES[i].cles[j]) !== -1) return REGLES[i].rep;
            }
        }
        return "Merci pour votre message ! Pour une réponse précise, notre équipe vous répond directement au +229 XX XX XX XX ou sur contact@moveandco.com — du lundi au samedi, 6h à 20h.";
    }

    /* ---------- Construction du widget ---------- */
    function construire() {
        var racine = document.createElement('div');

        racine.innerHTML =
            '<div class="chat-panneau" id="chatPanneau" role="dialog" aria-label="Chatbot Moussou" aria-modal="false">' +
                '<div class="chat-tete">' +
                    '<span class="chat-avatar" aria-hidden="true">M</span>' +
                    '<div>' +
                        '<div class="chat-nom">Moussou</div>' +
                        '<div class="chat-etat">Assistant Move &amp; Co · en ligne</div>' +
                    '</div>' +
                '</div>' +
                '<div class="chat-corps" id="chatCorps" role="log" aria-live="polite"></div>' +
                '<div class="chat-pied">' +
                    '<textarea class="chat-champ" id="chatChamp" rows="1" placeholder="Votre message..." aria-label="Votre message"></textarea>' +
                    '<button class="chat-envoyer" id="chatEnvoyer" type="button" aria-label="Envoyer">' +
                        '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
                    '</button>' +
                '</div>' +
                '<p class="chat-disclaimer">Réponses automatisées — pour une réservation, contactez l\'équipe.</p>' +
            '</div>' +
            '<button class="chat-launcher" id="chatLauncher" type="button" aria-label="Ouvrir le chat" aria-expanded="false">' +
                '<span class="pastille" aria-hidden="true"></span>' +
                '<svg class="ico-chat" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>' +
                '<svg class="ico-close" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>';

        document.body.appendChild(racine);
    }

    /* ---------- Utilitaires ---------- */
    function miseEnForme(t) {
        var e = String(t)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        /* **gras** et *italique* Markdown → HTML */
        e = e.replace(/\*\*([^*\n]+)\*\*/g, '<strong class="gras">$1</strong>');
        e = e.replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1<em>$2</em>');
        return e.replace(/\n/g, '<br>');
    }

    function ajouterMsg(classe, texte) {
        var corps = document.getElementById('chatCorps');
        var bulle = document.createElement('div');
        bulle.className = 'msg ' + classe;
        bulle.innerHTML = miseEnForme(texte);
        corps.appendChild(bulle);
        corps.scrollTop = corps.scrollHeight;
        return bulle;
    }

    function frappe(visible) {
        var corps = document.getElementById('chatCorps');
        var existant = document.getElementById('chatFrappe');
        if (visible && !existant) {
            var d = document.createElement('div');
            d.className = 'msg-frappe';
            d.id = 'chatFrappe';
            d.setAttribute('aria-label', 'Moussou écrit...');
            d.innerHTML = '<span></span><span></span><span></span>';
            corps.appendChild(d);
            corps.scrollTop = corps.scrollHeight;
        } else if (!visible && existant) {
            existant.remove();
        }
    }

    function suggestions() {
        var corps = document.getElementById('chatCorps');
        var bloc = document.createElement('div');
        bloc.className = 'msg-suggestions';
        ['Vos tarifs ?', 'Les horaires ?', 'Formules de coaching', 'Prendre un bilan'].forEach(function (s) {
            var b = document.createElement('button');
            b.type = 'button';
            b.textContent = s;
            b.addEventListener('click', function () { bloc.remove(); envoyer(s); });
            bloc.appendChild(b);
        });
        corps.appendChild(bloc);
        corps.scrollTop = corps.scrollHeight;
    }

    /* ---------- Envoi ---------- */
    function envoyer(texte) {
        texte = (texte || '').trim();
        if (!texte || enAttente) return;

        var champ = document.getElementById('chatChamp');
        var bouton = document.getElementById('chatEnvoyer');

        ajouterMsg('utilisateur', texte);
        HISTORIQUE.push({ role: 'user', parts: texte });
        champ.value = '';
        autoHauteur(champ);
        enAttente = true;
        bouton.disabled = true;
        frappe(true);

        var demarrage = Date.now();

        fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: texte, historique: HISTORIQUE.slice(0, -1) })
        })
            .then(function (r) {
                if (!r.ok) throw new Error('api');
                return r.json();
            })
            .then(function (d) {
                repondre(d && d.reply ? d.reply : reponseSecours(texte), demarrage);
            })
            .catch(function () {
                repondre(reponseSecours(texte), demarrage);
            });
    }

    function repondre(texte, demarrage) {
        var reste = Math.max(0, (reduit ? 0 : 700) - (Date.now() - demarrage));
        setTimeout(function () {
            frappe(false);
            ajouterMsg('bot', texte);
            HISTORIQUE.push({ role: 'model', parts: texte });
            enAttente = false;
            document.getElementById('chatEnvoyer').disabled = false;
        }, reste);
    }

    var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function autoHauteur(champ) {
        champ.style.height = 'auto';
        champ.style.height = Math.min(champ.scrollHeight, 110) + 'px';
    }

    function init() {
        construire();

        var launcher = document.getElementById('chatLauncher');
        var panneau = document.getElementById('chatPanneau');
        var champ = document.getElementById('chatChamp');
        var corps = document.getElementById('chatCorps');
        var ouvert = false;
        var accueilFait = false;

        function basculer(etat) {
            ouvert = (typeof etat === 'boolean') ? etat : !ouvert;
            panneau.classList.toggle('ouvert', ouvert);
            launcher.classList.toggle('ouvert', ouvert);
            launcher.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
            launcher.setAttribute('aria-label', ouvert ? 'Fermer le chat' : 'Ouvrir le chat');

            if (ouvert && !accueilFait) {
                accueilFait = true;
                ajouterMsg('bot', "Bonjour ! Je suis Moussou, l'assistant de Move & Co. Coaching, horaires, boutique... posez votre question !");
                setTimeout(suggestions, reduit ? 0 : 500);
            }
            if (ouvert) setTimeout(function () { champ.focus(); }, 420);
        }

        launcher.addEventListener('click', function () { basculer(); });

        document.getElementById('chatEnvoyer').addEventListener('click', function () { envoyer(champ.value); });

        champ.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                envoyer(champ.value);
            }
        });

        champ.addEventListener('input', function () { autoHauteur(champ); });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && ouvert) basculer(false);
        });

        document.addEventListener('click', function (e) {
            if (!ouvert) return;
            /* composedPath conserve la chaîne d'ancêtres même si le nœud
               cliqué a été retiré du DOM (ex : bouton de suggestion) */
            var chemin = (typeof e.composedPath === 'function') ? e.composedPath() : [];
            if (chemin.indexOf(panneau) === -1 && chemin.indexOf(launcher) === -1) basculer(false);
        });

        void corps;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
