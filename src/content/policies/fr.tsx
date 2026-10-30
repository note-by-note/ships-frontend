// The policies in French: a translation of en.tsx, which is the version that
// applies. Everyone is "vous". Names of buttons and pages on the site, which
// is in English, are given in English where people need to find them.

import Link from 'next/link';
import { policyHref } from '@/lib/policy-languages';
import type { PolicySet } from './types';

const to = (path: string) => policyHref(path, 'fr');

export const fr: PolicySet = {
  chrome: {
    names: {
      conduct: 'Code de conduite',
      terms: 'Conditions d’utilisation',
      privacy: 'Politique de confidentialité',
      consent: 'Consentement des parents et tuteurs',
    },
    policiesLabel: 'Politiques',
    languageLabel: 'Langue',
    lastUpdated: (date) => `Dernière mise à jour : ${date}`,
    onThisPage: 'Sur cette page',
    translationNote: 'Ceci est une traduction. En cas de différence avec la version anglaise, c’est la version anglaise qui s’applique.',
    readInEnglish: 'Lire en anglais',
  },

  conduct: {
    title: 'Code de conduite',
    description: 'Comment les élèves, les familles, les mentors et les bénévoles se comportent les uns envers les autres chez Note by Note.',
    summary: (
      <p>
        Note by Note fonctionne parce que les élèves, les familles et les bénévoles se font confiance. Ce code s’applique
        à toute personne ayant un compte&nbsp;: élèves, parents et tuteurs, mentors et bénévoles de toutes les équipes.
      </p>
    ),
    sections: [
      {
        id: 'respect',
        title: 'Respecter les autres',
        body: (
          <>
            <p>
              Traitez tout le monde avec gentillesse et patience. Le harcèlement, l’intimidation et la discrimination sont
              interdits, qu’il s’agisse de race, d’origine ethnique, de religion, de genre, d’identité de genre,
              d’orientation sexuelle, de handicap, d’âge, de milieu ou de niveau musical.
            </p>
            <p>
              Les commentaires portent sur la musique, pas sur la personne. Tous les styles de musique et tous les niveaux
              de départ sont les bienvenus.
            </p>
          </>
        ),
      },
      {
        id: 'reliable',
        title: 'Être présent',
        body: (
          <>
            <p>
              Venez aux cours prévus, à l’heure. Si vous ne pouvez pas venir, prévenez l’autre personne le plus tôt
              possible sur la <Link href="/dashboard/lessons">page des cours</Link> (Lessons).
            </p>
            <p>
              Si vous devez arrêter les cours, dites-le à votre mentor ou à votre élève, et prévenez l’équipe par la{' '}
              <Link href="/contact">page de contact</Link>, pour que personne n’attende pour rien.
            </p>
          </>
        ),
      },
      {
        id: 'safe-lessons',
        title: 'Des cours en sécurité',
        body: (
          <>
            <p>
              Beaucoup de nos élèves ont moins de 18&nbsp;ans, et beaucoup de nos mentors sont eux aussi élèves ou
              étudiants. Pour la sécurité de tous&nbsp;:
            </p>
            <ul>
              <li>
                Les cours ont lieu en ligne, par le lien d’appel vidéo de la page des cours. Ne vous rencontrez pas en
                personne.
              </li>
              <li>
                Restez en contact par la messagerie de Note by Note. Ne demandez pas et ne partagez pas de numéro de
                téléphone personnel, de réseaux sociaux ni d’adresse.
              </li>
              <li>Gardez les conversations centrées sur la musique et les cours.</li>
              <li>Participez aux appels vidéo depuis un endroit adapté, dans une tenue comme pour aller à l’école.</li>
              <li>
                Pour les élèves de moins de 13&nbsp;ans, un parent ou un tuteur doit être à proximité pendant les cours.
                Les élèves de moins de 18&nbsp;ans ont besoin du <Link href={to('/parent-consent')}>consentement</Link>{' '}
                d’un parent ou d’un tuteur avant de commencer les cours.
              </li>
              <li>
                N’enregistrez pas un cours et ne prenez pas de photos ou de captures d’écran de l’autre personne sans
                l’accord des deux. Pour un élève de moins de 18&nbsp;ans, son parent ou tuteur doit aussi être d’accord.
              </li>
              <li>Pas de cadeaux, pas d’argent. Les cours sont gratuits, et les mentors ne demandent jamais de paiement.</li>
            </ul>
          </>
        ),
      },
      {
        id: 'mentors',
        title: 'Pour les mentors',
        body: (
          <ul>
            <li>
              Vous êtes un modèle. Faites preuve de patience, encouragez votre élève et soyez clair sur ce que vous pouvez
              enseigner.
            </li>
            <li>Gardez une relation amicale mais professionnelle avec votre élève et sa famille.</li>
            <li>Gardez pour vous ce que vous savez de votre élève. Ne partagez pas ses informations en dehors de Note by Note.</li>
            <li>
              Si un élève dit quelque chose qui vous inquiète pour sa sécurité, prévenez l’équipe tout de suite par la{' '}
              <Link href="/contact">page de contact</Link>. N’essayez pas de gérer la situation par vous-même.
            </li>
          </ul>
        ),
      },
      {
        id: 'volunteers',
        title: 'Pour les bénévoles de l’équipe',
        body: (
          <ul>
            <li>
              N’utilisez ce que vous voyez dans l’espace de l’équipe (Staff area) que pour votre rôle, et seulement quand
              c’est nécessaire.
            </li>
            <li>
              Ne copiez pas, ne téléchargez pas et ne partagez pas les informations personnelles de qui que ce soit en
              dehors de Note by Note.
            </li>
            <li>
              Les administrateurs ne lisent les messages entre mentors et élèves que pour assurer la sécurité de chacun,
              par exemple quand un message est signalé.
            </li>
            <li>
              Ne prenez pas de décision sur votre propre candidature ou vos propres cours. Demandez à quelqu’un d’autre de
              l’équipe.
            </li>
          </ul>
        ),
      },
      {
        id: 'sharing',
        title: 'Partager des fichiers et de la musique',
        body: (
          <>
            <p>
              Ne partagez que ce que vous avez le droit de partager. Respectez le droit d’auteur&nbsp;: ne transmettez pas
              de partitions payantes ni d’enregistrements que vous n’avez pas le droit de partager.
            </p>
            <p>
              Les enregistrements, compositions et autres travaux d’un élève lui appartiennent. Ne les partagez avec
              personne sans sa permission, et celle de son parent ou tuteur s’il a moins de 18&nbsp;ans.
            </p>
          </>
        ),
      },
      {
        id: 'messages',
        title: 'Messages et vérifications de sécurité',
        body: (
          <p>
            Les messages entre mentors et élèves restent sur Note by Note pour que nous puissions assurer la sécurité de
            tous. Les administrateurs de Note by Note peuvent les lire, par exemple quand un message est signalé. Les
            autres bénévoles ne le peuvent pas. Vous trouverez plus de détails dans notre{' '}
            <Link href={to('/privacy')}>Politique de confidentialité</Link>.
          </p>
        ),
      },
      {
        id: 'report',
        title: 'Signaler un problème',
        body: (
          <>
            <p>
              Si quelque chose ne vous semble pas normal, dites-le-nous. Utilisez <strong>Report</strong> (Signaler) sur
              un message, un cours ou la page d’un mentor, ou <Link href="/dashboard/report">signalez un problème</Link>{' '}
              depuis votre tableau de bord. Vous pouvez aussi nous écrire par la{' '}
              <Link href="/contact">page de contact</Link>. La personne signalée ne sait pas qui l’a signalée.
            </p>
            <p>Si quelqu’un est en danger, contactez d’abord les services d’urgence de votre région.</p>
          </>
        ),
      },
      {
        id: 'breaking',
        title: 'Si ce code n’est pas respecté',
        body: (
          <>
            <p>
              Selon ce qui s’est passé, nous pouvons faire un rappel, suspendre les cours, mettre fin à un binôme
              mentor-élève, retirer quelqu’un du programme ou fermer son compte.
            </p>
            <p>
              Si nous sommes inquiets pour la sécurité d’un enfant, nous pouvons prévenir son parent ou tuteur et, lorsque
              la loi l’exige, les autorités.
            </p>
          </>
        ),
      },
    ],
  },

  terms: {
    title: 'Conditions d’utilisation',
    description: 'Les conditions pour utiliser le site de Note by Note et participer à ses cours de musique gratuits.',
    summary: (
      <p>
        En bref&nbsp;: les cours sont gratuits, les mentors sont bénévoles, on veille à la sécurité de tous et on respecte
        ce que les autres partagent. Les détails sont ci-dessous.
      </p>
    ),
    sections: [
      {
        id: 'about',
        title: 'À propos de ces conditions',
        body: (
          <>
            <p>
              Ces conditions s’appliquent à toute personne qui utilise le site de Note by Note. En créant un compte ou en
              utilisant le site, vous acceptez ces conditions, notre{' '}
              <Link href={to('/code-of-conduct')}>Code de conduite</Link> et la façon dont nous traitons les informations,
              décrite dans notre <Link href={to('/privacy')}>Politique de confidentialité</Link>.
            </p>
            <p>Si vous avez moins de 18&nbsp;ans, lisez ces conditions avec un parent ou un tuteur.</p>
          </>
        ),
      },
      {
        id: 'what-we-are',
        title: 'Ce qu’est Note by Note',
        body: (
          <>
            <p>
              Note by Note est un programme bénévole mené par des élèves et des étudiants, qui propose des cours de
              musique gratuits en ligne. Les mentors sont bénévoles, souvent eux-mêmes élèves ou étudiants. Ils jouent
              bien de leur instrument et l’expliquent avec patience, mais ce ne sont pas des professeurs professionnels.
            </p>
            <p>
              Les cours sont gratuits. Nous faisons de notre mieux pour trouver un mentor à chaque élève, mais nous ne
              pouvons pas promettre un jumelage, un mentor en particulier, un nombre fixe de cours ni un résultat précis.
            </p>
          </>
        ),
      },
      {
        id: 'accounts',
        title: 'Votre compte',
        body: (
          <ul>
            <li>Donnez des informations exactes et tenez-les à jour.</li>
            <li>Gardez votre mot de passe pour vous. Vous êtes responsable de ce qui se passe sur votre compte.</li>
            <li>Une personne par compte. Un parent ou un tuteur peut créer et gérer un compte pour son enfant.</li>
            <li>
              Si vous pensez que quelqu’un d’autre a utilisé votre compte, prévenez-nous par la{' '}
              <Link href="/contact">page de contact</Link>.
            </li>
          </ul>
        ),
      },
      {
        id: 'under-18',
        title: 'Élèves de moins de 18 ans',
        body: (
          <p>
            Un parent ou un tuteur doit donner son <Link href={to('/parent-consent')}>consentement</Link> avant qu’un
            élève de moins de 18&nbsp;ans commence les cours. Il peut le retirer à tout moment en nous contactant, et les
            cours s’arrêteront.
          </p>
        ),
      },
      {
        id: 'lessons',
        title: 'Les cours',
        body: (
          <>
            <p>
              Les élèves et les mentors organisent les cours sur le site. Les cours ont lieu par un service d’appel vidéo,
              comme Zoom ou Google Meet, avec le lien de la page des cours. Les conditions et la politique de
              confidentialité de ce service s’appliquent à l’appel.
            </p>
            <p>Chacun peut arrêter les cours à tout moment. Merci de prévenir l’autre personne et l’équipe.</p>
          </>
        ),
      },
      {
        id: 'content',
        title: 'Ce que vous partagez',
        body: (
          <>
            <p>
              Ce que vous publiez ou téléversez vous appartient&nbsp;: messages, fichiers, enregistrements et votre page
              de mentor. Vous autorisez Note by Note à le conserver et à le montrer aux personnes à qui il est destiné,
              pour que le site fonctionne.
            </p>
            <p>
              La page d’un mentor, avec une photo approuvée, est publique dans Find a Mentor (Trouver un mentor) une fois
              que notre équipe l’a publiée. Les membres de l’équipe présentés sur la page About (À propos) y apparaissent
              aussi.
            </p>
            <p>
              Ne partagez rien d’illégal ou de nuisible, ni rien que vous n’avez pas le droit de partager. Nous pouvons
              retirer un contenu qui ne respecte pas ces conditions ou le Code de conduite.
            </p>
          </>
        ),
      },
      {
        id: 'use',
        title: 'Utiliser le site correctement',
        body: (
          <ul>
            <li>N’essayez pas d’accéder aux comptes d’autres personnes ni aux parties du site auxquelles vous n’avez pas accès.</li>
            <li>Ne perturbez pas le site, ne le surchargez pas et n’en copiez pas les informations en masse.</li>
            <li>Ne l’utilisez pas pour envoyer du spam ou de la publicité.</li>
          </ul>
        ),
      },
      {
        id: 'volunteers',
        title: 'Bénévoles',
        body: (
          <>
            <p>
              Les bénévoles de nos équipes ont accès à ce dont leur rôle a besoin. Cet accès sert uniquement au travail de
              Note by Note, et ce que vous y voyez est confidentiel.
            </p>
            <p>
              Les heures de bénévolat sont enregistrées sur le site et approuvées par l’équipe. Nous ne pouvons pas
              promettre qu’une école ou un organisme les acceptera.
            </p>
          </>
        ),
      },
      {
        id: 'ending',
        title: 'Fermer un compte',
        body: (
          <p>
            Vous pouvez nous demander de fermer votre compte à tout moment par la{' '}
            <Link href="/contact">page de contact</Link>. Nous pouvons suspendre ou fermer un compte qui ne respecte pas
            ces conditions ou le Code de conduite, ou pour protéger quelqu’un.
          </p>
        ),
      },
      {
        id: 'no-guarantees',
        title: 'Aucune garantie',
        body: (
          <>
            <p>
              Le site est géré par des bénévoles et fourni tel quel. Il peut parfois être lent ou indisponible, par
              exemple pendant que notre serveur redémarre après une période calme.
            </p>
            <p>
              Dans la mesure permise par la loi, Note by Note et ses bénévoles ne sont pas responsables des pertes
              indirectes liées à l’utilisation du site ou des cours. Rien dans ces conditions ne retire les droits que
              vous donne la loi.
            </p>
          </>
        ),
      },
      {
        id: 'changes',
        title: 'Modifications de ces conditions',
        body: (
          <p>
            Nous pouvons mettre à jour ces conditions. La date en haut indique leur dernière modification. Si un
            changement compte pour votre utilisation du site, nous vous demanderons d’accepter la nouvelle version lors de
            votre prochaine connexion.
          </p>
        ),
      },
      {
        id: 'contact',
        title: 'Contact',
        body: (
          <p>
            Des questions sur ces conditions&nbsp;? Écrivez-nous par la <Link href="/contact">page de contact</Link>.
          </p>
        ),
      },
    ],
  },

  privacy: {
    title: 'Politique de confidentialité',
    description: 'Quelles informations Note by Note conserve, pourquoi, et qui peut les voir.',
    summary: (
      <p>
        Nous conservons ce dont nous avons besoin pour offrir des cours gratuits et protéger les élèves. Nous ne le
        vendons pas et ne l’utilisons pas pour la publicité.
      </p>
    ),
    sections: [
      {
        id: 'collect',
        title: 'Ce que nous conservons',
        body: (
          <>
            <p>
              Nous ne conservons que ce dont nous avons besoin pour offrir des cours gratuits et assurer la sécurité de
              chacun&nbsp;:
            </p>
            <ul>
              <li>
                <strong>Votre compte&nbsp;:</strong> votre nom, votre adresse courriel et votre rôle. Votre mot de passe
                est conservé sous une forme brouillée, si bien que personne chez Note by Note ne peut le lire.
              </li>
              <li>
                <strong>Candidatures&nbsp;:</strong> vos réponses, comme votre école, votre tranche d’âge, votre
                instrument, votre niveau, les jours et heures où vous êtes libre, vos langues et vos objectifs. Pour un
                élève de moins de 18&nbsp;ans, le nom et le courriel d’un parent ou d’un tuteur.
              </li>
              <li>
                <strong>Pages de mentor&nbsp;:</strong> ce que les mentors écrivent sur eux-mêmes, leurs instruments,
                leurs disponibilités de la semaine et une photo s’ils en ajoutent une.
              </li>
              <li>
                <strong>Cours&nbsp;:</strong> les demandes, les horaires de cours convenus, les avis «&nbsp;je ne peux pas
                venir&nbsp;», les notes de cours, les listes d’exercices et les liens d’appel vidéo.
              </li>
              <li>
                <strong>Messages et fichiers</strong> échangés entre un mentor et son élève.
              </li>
              <li>
                <strong>Heures de bénévolat</strong> que notent les mentors et les bénévoles.
              </li>
              <li>
                <strong>Accords&nbsp;:</strong> la date à laquelle vous avez accepté le Code de conduite et les
                Conditions d’utilisation, et le nom que vous avez tapé. Pour un élève de moins de 18&nbsp;ans, le
                consentement de son parent ou tuteur&nbsp;: son nom, son courriel, son lien avec l’élève et la date.
              </li>
              <li>
                <strong>Messages envoyés par notre formulaire de contact.</strong>
              </li>
              <li>
                <strong>Visites&nbsp;:</strong> les pages consultées, sans les parties de l’adresse web qui pourraient
                vous identifier.
              </li>
            </ul>
          </>
        ),
      },
      {
        id: 'use',
        title: 'Comment nous les utilisons',
        body: (
          <>
            <p>
              Pour jumeler élèves et mentors, organiser et donner les cours, assurer la sécurité de tous, vous contacter
              au sujet du programme et savoir quelles pages sont utiles.
            </p>
            <p>Nous ne vendons pas vos informations et ne les utilisons pas pour la publicité.</p>
          </>
        ),
      },
      {
        id: 'who-sees',
        title: 'Qui peut les voir',
        body: (
          <ul>
            <li>
              <strong>Votre mentor ou votre élève.</strong> Avant d’accepter un élève, le mentor voit son prénom, sa
              tranche d’âge, son niveau, son instrument et ses horaires préférés. Une fois qu’il l’a accepté, il voit
              aussi le nom et le courriel du compte qui a fait la demande.
            </li>
            <li>
              <strong>Le public.</strong> Les pages de mentor publiées, avec les photos approuvées, apparaissent dans Find
              a Mentor. Les membres de l’équipe présentés sur la page About y apparaissent. Rien d’autre n’est public.
            </li>
            <li>
              <strong>L’équipe de Note by Note.</strong> Les bénévoles ne voient que ce dont leur rôle a besoin. Les
              administrateurs peuvent lire les messages entre mentors et élèves pour assurer la sécurité de chacun, par
              exemple quand un message est signalé. Certains bénévoles ne voient que des totaux, jamais de noms.
            </li>
            <li>
              <strong>Les services qui font fonctionner le site</strong> (listés ci-dessous), uniquement pour ce travail.
            </li>
            <li>
              <strong>D’autres personnes, seulement si nous y sommes obligés&nbsp;:</strong> si la loi l’exige, ou pour
              protéger quelqu’un d’un danger.
            </li>
          </ul>
        ),
      },
      {
        id: 'services',
        title: 'Services que nous utilisons',
        body: (
          <ul>
            <li>
              <strong>Vercel</strong> héberge le site et compte les visites des pages.
            </li>
            <li>
              <strong>Render</strong> fait fonctionner notre serveur.
            </li>
            <li>
              <strong>MongoDB Atlas</strong> conserve notre base de données.
            </li>
            <li>
              <strong>Google Analytics</strong> compte les visites. Nous avons désactivé Google Signals et la
              personnalisation des annonces, et nous retirons des adresses qu’il voit tout ce qui pourrait vous
              identifier.
            </li>
            <li>
              <strong>Formspree</strong> transmet les messages de notre formulaire de contact.
            </li>
            <li>
              <strong>Un service d’envoi de courriels</strong> envoie les courriels du site, comme les avis de cours et
              les demandes de consentement.
            </li>
            <li>
              <strong>Les services d’appel vidéo</strong> que vous choisissez pour les cours, comme Zoom ou Google Meet,
              ont leur propre politique de confidentialité.
            </li>
          </ul>
        ),
      },
      {
        id: 'cookies',
        title: 'Cookies et stockage du navigateur',
        body: (
          <>
            <p>
              Pour que vous restiez connecté, le site enregistre une clé de connexion dans le stockage de votre
              navigateur. Il retient aussi de petites préférences, comme le dernier onglet du tableau de bord utilisé. La
              déconnexion supprime la clé de connexion.
            </p>
            <p>
              Google Analytics utilise des cookies pour compter les visites. Le comptage des visites de Vercel n’utilise
              pas de cookies. Vous pouvez bloquer ou effacer les cookies dans les réglages de votre navigateur&nbsp;; le
              site fonctionne quand même.
            </p>
          </>
        ),
      },
      {
        id: 'security',
        title: 'Sécurité',
        body: (
          <p>
            Les connexions au site sont chiffrées. Les mots de passe sont conservés sous une forme brouillée. Les données
            de lieu et d’appareil photo sont retirées des photos téléversées. L’accès des bénévoles est limité à leur
            rôle, et l’équipe ne peut entrer que dans des comptes de test, jamais dans le compte d’une vraie personne.
          </p>
        ),
      },
      {
        id: 'how-long',
        title: 'Durée de conservation',
        body: (
          <p>
            Nous conservons vos informations tant que votre compte est ouvert. Quand vous nous demandez de le fermer, nous
            supprimons vos informations ou les rendons anonymes, sauf ce que nous devons garder pour des raisons de
            sécurité ou parce que la loi l’exige.
          </p>
        ),
      },
      {
        id: 'choices',
        title: 'Vos choix',
        body: (
          <ul>
            <li>
              Demandez à voir, corriger ou supprimer vos informations par la <Link href="/contact">page de contact</Link>.
            </li>
            <li>
              Choisissez les courriels que vous recevez dans les{' '}
              <Link href="/dashboard/settings">paramètres de votre compte</Link>.
            </li>
            <li>Un parent ou un tuteur peut retirer son consentement pour son enfant à tout moment en nous contactant.</li>
          </ul>
        ),
      },
      {
        id: 'children',
        title: 'Enfants et adolescents',
        body: (
          <p>
            Beaucoup de nos élèves ont moins de 18&nbsp;ans. Un parent ou un tuteur donne son{' '}
            <Link href={to('/parent-consent')}>consentement</Link> avant le début des cours, et peut demander à voir ou à
            supprimer les informations de son enfant. Si vous avez moins de 13&nbsp;ans, demandez à un parent ou à un
            tuteur de créer votre compte avec vous.
          </p>
        ),
      },
      {
        id: 'changes',
        title: 'Modifications de cette politique',
        body: (
          <p>
            Si nous changeons notre façon de traiter les informations, nous mettrons à jour cette page et la date en haut.
          </p>
        ),
      },
      {
        id: 'contact',
        title: 'Contact',
        body: (
          <p>
            Des questions sur la confidentialité&nbsp;? Écrivez-nous par la <Link href="/contact">page de contact</Link>.
          </p>
        ),
      },
    ],
  },

  consent: {
    title: 'Consentement des parents et tuteurs',
    description: 'Ce qu’acceptent les parents et tuteurs quand un élève de moins de 18 ans suit des cours avec Note by Note.',
    summary: (
      <p>
        Les élèves de moins de 18&nbsp;ans ont besoin du consentement d’un parent ou d’un tuteur avant de commencer les
        cours. Voici en quoi consistent les cours et ce que vous acceptez.
      </p>
    ),
    sections: [
      {
        id: 'lessons',
        title: 'En quoi consistent les cours',
        body: (
          <ul>
            <li>
              Des cours de musique gratuits et individuels avec un mentor bénévole, souvent un élève du secondaire ou un
              étudiant à l’université.
            </li>
            <li>
              Les cours ont lieu par appel vidéo, comme Zoom ou Google Meet, à un horaire hebdomadaire convenu entre votre
              enfant et son mentor.
            </li>
            <li>
              Votre enfant et son mentor peuvent s’envoyer des messages, partager des fichiers et tenir des notes de cours
              sur le site de Note by Note.
            </li>
            <li>C’est gratuit, et les mentors ne demandent jamais d’argent ni de cadeaux.</li>
          </ul>
        ),
      },
      {
        id: 'safety',
        title: 'Comment nous protégeons les élèves',
        body: (
          <ul>
            <li>
              Tout le monde accepte notre <Link href={to('/code-of-conduct')}>Code de conduite</Link>&nbsp;: les cours
              restent en ligne, les échanges restent sur le site et les conversations portent sur la musique.
            </li>
            <li>
              Les mentors ne demandent pas de numéro de téléphone, de réseaux sociaux ni d’adresse, et ne rencontrent pas
              les élèves en personne.
            </li>
            <li>
              Les administrateurs de Note by Note peuvent lire les messages entre mentors et élèves, par exemple quand un
              message est signalé.
            </li>
            <li>
              Les cours ne sont pas enregistrés sans l’accord des deux côtés et, pour votre enfant, sans le vôtre aussi.
            </li>
            <li>
              Les élèves et les parents peuvent signaler un problème à tout moment, et la personne signalée ne sait pas qui
              l’a signalée.
            </li>
          </ul>
        ),
      },
      {
        id: 'information',
        title: 'Ce que voit le mentor de votre enfant',
        body: (
          <p>
            Avant d’accepter, le mentor voit le prénom de votre enfant, sa tranche d’âge, son niveau, son instrument et
            ses horaires préférés. Une fois qu’il l’a accepté, il voit aussi le nom et le courriel du compte qui a fait la
            demande. Notre <Link href={to('/privacy')}>Politique de confidentialité</Link> explique le reste.
          </p>
        ),
      },
      {
        id: 'agreeing',
        title: 'Ce que vous acceptez',
        body: (
          <ul>
            <li>Vous êtes le parent ou le tuteur légal de l’élève, ou la personne qui en a la charge.</li>
            <li>Votre enfant peut suivre des cours gratuits en ligne et utiliser le site comme décrit ci-dessus.</li>
            <li>Vous avez lu le Code de conduite et la Politique de confidentialité.</li>
            <li>Pour un enfant de moins de 13&nbsp;ans, vous ou un autre adulte serez à proximité pendant les cours.</li>
          </ul>
        ),
      },
      {
        id: 'withdraw',
        title: 'Changer d’avis',
        body: (
          <p>
            Vous pouvez retirer votre consentement à tout moment par notre <Link href="/contact">page de contact</Link>.
            Les cours s’arrêteront, et vous pourrez nous demander de supprimer les informations de votre enfant.
          </p>
        ),
      },
    ],
  },
};
