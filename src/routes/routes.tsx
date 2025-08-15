import { Router, Route } from "@solidjs/router";
import App from "../App";
import LandingPage from "../pages/LandingPage";
import Login from "../pages/Login";
import Register from "../pages/Register";
import ForgotPassword from "../pages/Forgot";
import Dashboard from "../pages/Dashboard";
import MoodTracker from "../pages/MoodTracker";
import DailyJournal from "../pages/DailyJournal";
import PersonalStats from "../pages/PersonalStats";
import DailyMotivation from "../pages/DailyMotivation";

import HelpCenter from "../pages/HelpCenter";
import ContactPsychologist from "../pages/ContactPsychologist";
import PrivacyPolicy from "../pages/PrivacyPolicy";

import Mood from "../pages/Mood";
import Journal from "../pages/Journal";
import JournalCreate from "../pages/JournalCreate";
import Calendar from "../pages/Calendar";
import Statistics from "../pages/Statistics";
import Profile from "../pages/Profile";
import ProfileEdit from "../pages/ProfileEdit";
import ChangePassword from "../pages/ChangePassword";

import { Component } from "solid-js"

const AppRoutes: Component = () => {
  return (
    <Router>
      <Route path="/" component={() => <App><LandingPage /></App>} />
      <Route path="/login" component={() => <App><Login /></App>} />
      <Route path="/register" component={() => <App><Register /></App>} />
      <Route path="/forgot-password" component={() => <App><ForgotPassword /></App>} />
      <Route path="/dashboard" component={() => <App><Dashboard /></App>} />
      <Route path="/mood-tracker" component={() => <App><MoodTracker /></App>} />
      <Route path="/daily-journal" component={() => <App><DailyJournal /></App>} />
      <Route path="/personal-stats" component={() => <App><PersonalStats /></App>} />
      <Route path="/daily-motivation" component={() => <App><DailyMotivation /></App>} />

      <Route path="/help" component={() => <App><HelpCenter /></App>} />
      <Route path="/contact-psychologist" component={() => <App><ContactPsychologist /></App>} />
      <Route path="/privacy" component={() => <App><PrivacyPolicy /></App>} />

      <Route path="/mood" component={() => <App><Mood /></App>} />
      <Route path="/journal" component={() => <App><Journal /></App>} />
      <Route path="/journal/create" component={() => <App><JournalCreate /></App>} />
      <Route path="/calendar" component={() => <App><Calendar /></App>} />
      <Route path="/statistics" component={() => <App><Statistics /></App>} />
      <Route path="/profile" component={() => <App><Profile /></App>} />
      <Route path="/profile/edit" component={() => <App><ProfileEdit /></App>} />
      <Route path="/profile/change-password" component={() => <App><ChangePassword /></App>} />
    </Router>
  );
};

export default AppRoutes;