import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Statistics from '@/components/Statistics';
import Footer from '@/components/Footer';
import AboutUs from '@/components/AboutUs';
import Partners from '@/components/Partners';
import Areas from '@/components/Areas';
import ProjectImage from '@/components/ProjectImage';
import AboutSections from '@/components/AboutSections';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <Statistics />
      <AboutUs />
      <Partners />
      <Areas />
      <ProjectImage />
      <AboutSections />
      <Footer />
    </>
  );
}
