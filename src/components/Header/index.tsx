import Image from 'next/image';
import { useRouter } from 'next/router';
import { SignInButton } from '../SignInButton';

import styles from './styles.module.scss';
import { ActiveLink } from '../ActiveLink';

export function Header() {
  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <Image src="/images/logo.svg" alt="ig.news" width={110} height={31} />
        <nav>
          <ActiveLink href="/" activeClassName={styles.active}>
            <a>Home</a>
          </ActiveLink>
          <ActiveLink href="/posts" activeClassName={styles.active} prefetch>
            <a>Posts</a>
          </ActiveLink>
        </nav>
        <SignInButton />
      </div>
    </header>
  );
}
